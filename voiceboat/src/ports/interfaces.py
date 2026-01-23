from abc import ABC, abstractmethod
from typing import Dict, Any, List, AsyncIterator
from src.models.schemas import NLUResult, IntentType

class NLUPort(ABC):
    @abstractmethod
    async def analyze_text(self, text: str) -> NLUResult:
        pass

class BackendPort(ABC):
    @abstractmethod
    async def get_swap_history(self, driver_id: str, date_range: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def find_nearest_station(self, location: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def check_subscription(self, driver_id: str) -> Dict[str, Any]:
        pass

class HandoffPort(ABC):
    @abstractmethod
    async def escalate_to_agent(self, conversation_id: str, summary: Dict[str, Any]) -> bool:
        pass

class ASRPort(ABC):
    """Speech-to-Text Port"""
    @abstractmethod
    async def transcribe_audio(self, audio_data: bytes, language: str = "en-US") -> str:
        """Transcribe audio bytes to text"""
        pass
    
    @abstractmethod
    async def transcribe_stream(self, audio_stream: AsyncIterator[bytes], language: str = "en-US") -> AsyncIterator[str]:
        """Stream transcription for real-time audio"""
        pass

class TTSPort(ABC):
    """Text-to-Speech Port"""
    @abstractmethod
    async def synthesize_speech(self, text: str, language: str = "en-US", voice: str = "default") -> bytes:
        """Convert text to speech audio bytes"""
        pass

class TelephonyPort(ABC):
    """Telephony Integration Port"""
    @abstractmethod
    async def handle_incoming_call(self, call_sid: str, from_number: str, to_number: str) -> Dict[str, Any]:
        """Handle incoming call"""
        pass
    
    @abstractmethod
    async def stream_audio_to_call(self, call_sid: str, audio_data: bytes) -> bool:
        """Stream audio to active call"""
        pass
    
    @abstractmethod
    async def transfer_to_agent(self, call_sid: str, agent_number: str) -> bool:
        """Transfer call to human agent"""
        pass
