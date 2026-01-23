from typing import Dict, Any, Optional
import asyncio
from src.core.conversation.orchestrator import ConversationOrchestrator
from src.ports.interfaces import ASRPort, TTSPort, TelephonyPort
from src.models.schemas import ActionResponse
from src.core.voice.voice_activity_detector import VoiceActivityDetector

class VoiceOrchestrator:
    """Orchestrates voice interactions: ASR -> NLU -> Bot -> TTS"""
    
    def __init__(
        self,
        conversation_orchestrator: ConversationOrchestrator,
        asr: ASRPort,
        tts: TTSPort,
        telephony: TelephonyPort
    ):
        self.conversation = conversation_orchestrator
        self.asr = asr
        self.tts = tts
        self.telephony = telephony
        self.vad = VoiceActivityDetector()
        self.conversation_states: Dict[str, Dict[str, Any]] = {}  # Track conversation state
    
    async def process_voice_input(
        self,
        conversation_id: str,
        audio_data: bytes,
        language: str = "en-US"
    ) -> Dict[str, Any]:
        """Process voice input: VAD -> transcribe -> understand -> respond -> synthesize"""
        
        # Step 0: Voice Activity Detection - check if user actually spoke
        vad_result = self.vad.analyze_audio_level(audio_data)
        
        if not vad_result['has_speech']:
            # No speech detected - return prompt to encourage user to speak
            lang_code = "hi" if language.startswith("hi") else "en"
            prompt_text = self._get_proactive_prompt(conversation_id, lang_code)
            
            return {
                "transcribed_text": "",
                "response_text": prompt_text,
                "audio": None,  # Will use browser TTS
                "has_speech": False,
                "should_end": False,
                "needs_escalation": False,
                "proactive_prompt": True
            }
        
        # Step 1: Speech-to-Text
        text = await self.asr.transcribe_audio(audio_data, language)
        if not text or len(text.strip()) < 2:
            # Empty or very short transcription - prompt again
            lang_code = "hi" if language.startswith("hi") else "en"
            prompt_text = self._get_proactive_prompt(conversation_id, lang_code)
            return {
                "transcribed_text": "",
                "response_text": prompt_text,
                "audio": None,
                "has_speech": True,
                "should_end": False,
                "needs_escalation": False,
                "proactive_prompt": True
            }
        
        # Update conversation state
        if conversation_id not in self.conversation_states:
            self.conversation_states[conversation_id] = {
                "no_response_count": 0,
                "last_interaction": None
            }
        
        self.conversation_states[conversation_id]["no_response_count"] = 0
        self.conversation_states[conversation_id]["last_interaction"] = text
        
        # Step 2: Process with conversation orchestrator
        lang_code = "hi" if language.startswith("hi") else "en"
        response: ActionResponse = await self.conversation.handle_message(
            conversation_id, text, lang_code
        )
        
        # Step 3: Text-to-Speech
        audio_response = await self.tts.synthesize_speech(response.text, language)
        
        return {
            "transcribed_text": text,
            "response_text": response.text,
            "audio": audio_response,
            "has_speech": True,
            "should_end": response.should_end,
            "needs_escalation": response.needs_escalation,
            "proactive_prompt": False
        }
    
    def _get_proactive_prompt(self, conversation_id: str, language: str) -> str:
        """Get proactive prompt when no speech detected"""
        if conversation_id not in self.conversation_states:
            self.conversation_states[conversation_id] = {
                "no_response_count": 0,
                "last_interaction": None
            }
        
        state = self.conversation_states[conversation_id]
        state["no_response_count"] = state.get("no_response_count", 0) + 1
        
        count = state["no_response_count"]
        
        if language == "hi":
            prompts = [
                "हैलो? सुन रहा हूं, बोलो?",
                "क्या वहाँ हो?",
                "बताओ, क्या चाहिए?",
                "यहाँ हूं, बोलो क्या help चाहिए?",
            ]
            if count > 2:
                return "अगर help चाहिए तो बोलो, वरना call बंद कर रहा हूं"
        else:
            prompts = [
                "Hello? I'm listening, go ahead?",
                "Are you there?",
                "What do you need?",
                "I'm here, what's up?",
            ]
            if count > 2:
                return "If you need help, speak up. Otherwise, I'll end the call."
        
        return prompts[min(count - 1, len(prompts) - 1)]
    
    async def handle_incoming_call(
        self,
        call_sid: str,
        from_number: str,
        to_number: str
    ) -> Dict[str, Any]:
        """Handle incoming Twilio call"""
        return await self.telephony.handle_incoming_call(call_sid, from_number, to_number)
    
    async def transfer_to_agent(self, call_sid: str, agent_number: str) -> bool:
        """Transfer call to human agent"""
        return await self.telephony.transfer_to_agent(call_sid, agent_number)
