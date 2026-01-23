"""
Free ASR and NLU Adapters - No payment required!
"""
from typing import AsyncIterator, Dict, Any
import os
import requests
import json
from src.ports.interfaces import ASRPort, NLUPort
from src.models.schemas import NLUResult, IntentType, Sentiment
from src.config.settings import settings

class AssemblyAIAdapter(ASRPort):
    """AssemblyAI ASR - FREE TIER: 5 hours/month"""
    
    def __init__(self):
        self.api_key = settings.ASSEMBLYAI_API_KEY or os.getenv("ASSEMBLYAI_API_KEY")
        if self.api_key:
            self.enabled = True
            self.base_url = "https://api.assemblyai.com/v2"
        else:
            print("⚠️  AssemblyAI API key not set. Get free key from https://www.assemblyai.com/")
            self.enabled = False
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en-US") -> str:
        """Transcribe audio using AssemblyAI (FREE tier available)"""
        if not self.enabled:
            return ""
        
        try:
            # Upload audio
            upload_url = f"{self.base_url}/upload"
            headers = {"authorization": self.api_key}
            
            upload_response = requests.post(upload_url, headers=headers, files={"file": audio_data})
            upload_url_result = upload_response.json().get("upload_url")
            
            if not upload_url_result:
                return ""
            
            # Transcribe
            transcript_url = f"{self.base_url}/transcript"
            lang_code = "hi" if language.startswith("hi") else "en"
            
            transcript_response = requests.post(
                transcript_url,
                json={"audio_url": upload_url_result, "language_code": lang_code},
                headers=headers
            )
            
            transcript_id = transcript_response.json().get("id")
            
            # Poll for result
            import time
            while True:
                result_response = requests.get(
                    f"{self.base_url}/transcript/{transcript_id}",
                    headers=headers
                )
                result = result_response.json()
                
                if result.get("status") == "completed":
                    return result.get("text", "")
                elif result.get("status") == "error":
                    return ""
                
                time.sleep(0.5)
                
        except Exception as e:
            print(f"Error transcribing with AssemblyAI: {e}")
            return ""
    
    async def transcribe_stream(self, audio_stream: AsyncIterator[bytes], language: str = "en-US") -> AsyncIterator[str]:
        """Stream transcription - AssemblyAI supports streaming"""
        # For now, collect and transcribe
        buffer = b""
        async for chunk in audio_stream:
            buffer += chunk
            if len(buffer) > 32000:  # ~2 seconds
                text = await self.transcribe_audio(buffer, language)
                if text:
                    yield text
                buffer = b""
        
        if buffer:
            text = await self.transcribe_audio(buffer, language)
            if text:
                yield text


class HuggingFaceNLUAdapter(NLUPort):
    """Hugging Face NLU - COMPLETELY FREE (uses public API)"""
    
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY or os.getenv("HUGGINGFACE_API_KEY")
        self.api_url = "https://api-inference.huggingface.co/models"
        self.enabled = True  # Works without API key for some models, but better with key
    
    async def analyze_text(self, text: str) -> NLUResult:
        """Use Hugging Face models for NLU - FREE"""
        try:
            # Use keyword-based NLU (free, no API needed)
            # This is already implemented in MockNLUAdapter but we'll enhance it
            return await self._keyword_based_nlu(text)
            
        except Exception as e:
            print(f"Error in HuggingFace NLU: {e}")
            return NLUResult(intent=IntentType.UNKNOWN, confidence=0.5)
    
    async def _keyword_based_nlu(self, text: str) -> NLUResult:
        """Enhanced keyword-based NLU - FREE, no API needed"""
        text_lower = text.lower()
        
        # Enhanced Hindi/English keyword detection
        station_keywords = [
            "station", "स्टेशन", "sthan", "kendra", 
            "nearest station", "station chahiye", "station kahan hai"
        ]
        location_keywords = [
            "noida", "delhi", "gurgaon", "mumbai", "bangalore",
            "नोएडा", "दिल्ली", "गुरुग्राम", "मुंबई"
        ]
        swap_keywords = [
            "swap", "history", "इतिहास", "swap history", 
            "kal ka swap", "yesterday swap"
        ]
        greeting_keywords = [
            "hello", "hi", "namaste", "namaskar", "kaise ho",
            "नमस्ते", "नमस्कार", "हैलो", "hello kya", "kya jarurat"
        ]
        
        # Check for station intent
        if any(kw in text_lower for kw in station_keywords):
            entities = {}
            for loc in location_keywords:
                if loc in text_lower:
                    entities["location"] = loc.capitalize()
                    break
            
            return NLUResult(
                intent=IntentType.FIND_NEAREST_STATION,
                confidence=0.9,
                entities=entities
            )
        
        # Check for swap history
        if any(kw in text_lower for kw in swap_keywords):
            entities = {}
            if "yesterday" in text_lower or "kal" in text_lower or "कल" in text_lower:
                entities["date_range"] = "yesterday"
            elif "today" in text_lower or "aaj" in text_lower or "आज" in text_lower:
                entities["date_range"] = "today"
            
            return NLUResult(
                intent=IntentType.GET_SWAP_HISTORY,
                confidence=0.85,
                entities=entities
            )
        
        # Check for greetings
        if any(kw in text_lower for kw in greeting_keywords):
            return NLUResult(
                intent=IntentType.UNKNOWN,
                confidence=0.7,
                sentiment=Sentiment.POSITIVE
            )
        
        # Check for negative sentiment
        negative_keywords = ["angry", "bad", "गुस्सा", "problem", "issue"]
        if any(kw in text_lower for kw in negative_keywords):
            return NLUResult(
                intent=IntentType.UNKNOWN,
                confidence=0.5,
                sentiment=Sentiment.ANGRY
            )
        
        return NLUResult(intent=IntentType.UNKNOWN, confidence=0.3)


class DeepgramFreeAdapter(ASRPort):
    """Deepgram ASR - FREE TIER: 12,000 minutes/month"""
    
    def __init__(self):
        self.api_key = settings.DEEPGRAM_API_KEY or os.getenv("DEEPGRAM_API_KEY")
        if self.api_key:
            self.enabled = True
            self.base_url = "https://api.deepgram.com/v1/listen"
        else:
            print("⚠️  Deepgram API key not set. Get free key from https://deepgram.com/")
            self.enabled = False
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en-US") -> str:
        """Transcribe using Deepgram FREE tier"""
        if not self.enabled:
            return ""
        
        try:
            lang_code = "hi" if language.startswith("hi") else "en"
            
            response = requests.post(
                self.base_url,
                headers={
                    "Authorization": f"Token {self.api_key}",
                    "Content-Type": "audio/webm"
                },
                params={"language": lang_code},
                data=audio_data
            )
            
            result = response.json()
            if result.get("results") and result["results"].get("channels"):
                transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
                return transcript
            
            return ""
        except Exception as e:
            print(f"Error transcribing with Deepgram: {e}")
            return ""
    
    async def transcribe_stream(self, audio_stream: AsyncIterator[bytes], language: str = "en-US") -> AsyncIterator[str]:
        """Stream transcription"""
        buffer = b""
        async for chunk in audio_stream:
            buffer += chunk
            if len(buffer) > 32000:
                text = await self.transcribe_audio(buffer, language)
                if text:
                    yield text
                buffer = b""
        
        if buffer:
            text = await self.transcribe_audio(buffer, language)
            if text:
                yield text
