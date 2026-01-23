"""
OpenAI Adapters for ASR (Whisper) and NLU (GPT)
"""
from typing import Dict, Any
import openai
from src.ports.interfaces import ASRPort, NLUPort
from src.models.schemas import NLUResult, IntentType, Sentiment
from src.config.settings import settings
import base64
import io

class WhisperSTTAdapter(ASRPort):
    """OpenAI Whisper Speech-to-Text Adapter"""
    
    def __init__(self):
        api_key = settings.OPENAI_API_KEY or openai.api_key
        if api_key:
            self.client = openai.OpenAI(api_key=api_key)
            self.enabled = True
        else:
            print("⚠️  OpenAI API key not configured. Set OPENAI_API_KEY environment variable.")
            self.client = None
            self.enabled = False
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en-US") -> str:
        """Transcribe audio using OpenAI Whisper"""
        if not self.enabled or not self.client:
            # Fallback to mock
            return "Hello, I need help finding a station"
        
        try:
            # Determine language code
            lang_code = "hi" if language.startswith("hi") else "en"
            
            # Create a file-like object from bytes
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "audio.webm"  # Whisper needs a filename
            
            # Call Whisper API
            # Reset file pointer to beginning
            audio_file.seek(0)
            
            # Whisper API accepts file-like objects directly
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=lang_code,
                response_format="text"
            )
            
            # Handle response (can be string or object)
            if isinstance(transcript, str):
                return transcript
            elif hasattr(transcript, 'text'):
                return transcript.text
            else:
                return str(transcript)
        except Exception as e:
            print(f"Error transcribing with Whisper: {e}")
            import traceback
            traceback.print_exc()
            # Fallback: return empty, will trigger proactive prompt
            return ""
    
    async def transcribe_stream(self, audio_stream, language: str = "en-US"):
        """Stream transcription - Whisper doesn't support streaming, so we batch"""
        # For streaming, collect chunks and transcribe periodically
        buffer = b""
        async for chunk in audio_stream:
            buffer += chunk
            # Transcribe every 2 seconds of audio (approximate)
            if len(buffer) > 32000:  # ~2 seconds at 16kHz
                text = await self.transcribe_audio(buffer, language)
                if text:
                    yield text
                buffer = b""
        
        # Transcribe remaining buffer
        if buffer:
            text = await self.transcribe_audio(buffer, language)
            if text:
                yield text


class OpenAILNUAdapter(NLUPort):
    """OpenAI GPT-based NLU Adapter - Understands natural language"""
    
    def __init__(self):
        api_key = settings.OPENAI_API_KEY or openai.api_key
        if api_key:
            self.client = openai.OpenAI(api_key=api_key)
            self.enabled = True
        else:
            print("⚠️  OpenAI API key not configured. Using mock NLU.")
            self.client = None
            self.enabled = False
    
    async def analyze_text(self, text: str) -> NLUResult:
        """Use GPT to understand natural language and extract intent/entities"""
        if not self.enabled or not self.client:
            # Fallback to mock
            return await self._mock_analyze(text)
        
        try:
            # System prompt for intent classification - understands casual Hinglish
            system_prompt = """You are an NLU system for a driver support voicebot. 
Analyze the user's message and extract:
1. Intent (one of: GetSwapHistory, FindNearestStation, CheckSubscription, ExplainInvoice, CheckAvailability, RenewSubscription, PricingInfo, LeaveInfo, FindDSK, Unknown)
2. Entities (location, date_range, etc.)
3. Sentiment (positive, neutral, negative, angry)
4. Confidence (0.0 to 1.0)

IMPORTANT: Understand casual Hinglish and natural speech patterns.

Respond in JSON format:
{
    "intent": "IntentType",
    "confidence": 0.9,
    "entities": {"location": "Noida", "date_range": "yesterday"},
    "sentiment": "neutral"
}

Examples:
- "नमस्ते, मुझे नोएडा में स्टेशन चाहिए" → {"intent": "FindNearestStation", "entities": {"location": "Noida"}, "confidence": 0.95}
- "hello kya jarurat hai?" → {"intent": "Unknown", "confidence": 0.8, "sentiment": "neutral"} (greeting + question)
- "hello kya chahiye?" → {"intent": "Unknown", "confidence": 0.8, "sentiment": "neutral"} (greeting + question)
- "station chahiye noida me" → {"intent": "FindNearestStation", "entities": {"location": "Noida"}, "confidence": 0.9}
- "swap history kal ka" → {"intent": "GetSwapHistory", "entities": {"date_range": "yesterday"}, "confidence": 0.9}
- "kya help chahiye" → {"intent": "Unknown", "confidence": 0.7, "sentiment": "neutral"}
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Fast and cost-effective
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            # Map to our schema
            intent_str = result.get("intent", "Unknown")
            try:
                intent = IntentType(intent_str)
            except ValueError:
                intent = IntentType.UNKNOWN
            
            sentiment_str = result.get("sentiment", "neutral")
            try:
                sentiment = Sentiment(sentiment_str)
            except ValueError:
                sentiment = Sentiment.NEUTRAL
            
            return NLUResult(
                intent=intent,
                confidence=result.get("confidence", 0.7),
                entities=result.get("entities", {}),
                sentiment=sentiment
            )
        except Exception as e:
            print(f"Error in OpenAI NLU: {e}")
            # Fallback to mock
            return await self._mock_analyze(text)
    
    async def _mock_analyze(self, text: str) -> NLUResult:
        """Fallback mock analysis"""
        text_lower = text.lower()
        
        # Simple keyword matching as fallback
        if "station" in text_lower or "स्टेशन" in text_lower:
            entities = {}
            for loc in ["noida", "delhi", "gurgaon", "नोएडा", "दिल्ली"]:
                if loc in text_lower:
                    entities["location"] = loc.capitalize()
            return NLUResult(intent=IntentType.FIND_NEAREST_STATION, confidence=0.8, entities=entities)
        
        if "swap" in text_lower or "history" in text_lower or "इतिहास" in text_lower:
            entities = {}
            if "yesterday" in text_lower or "kal" in text_lower or "कल" in text_lower:
                entities["date_range"] = "yesterday"
            return NLUResult(intent=IntentType.GET_SWAP_HISTORY, confidence=0.8, entities=entities)
        
        return NLUResult(intent=IntentType.UNKNOWN, confidence=0.5)
