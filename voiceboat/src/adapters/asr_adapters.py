from typing import AsyncIterator
import io
import base64
from src.ports.interfaces import ASRPort

class GoogleSTTAdapter(ASRPort):
    """Google Cloud Speech-to-Text Adapter"""
    
    def __init__(self):
        try:
            from google.cloud import speech
            self.client = speech.SpeechClient()
            self.enabled = True
        except ImportError:
            print("⚠️  google-cloud-speech not installed. Using mock mode.")
            self.client = None
            self.enabled = False
        except Exception as e:
            print(f"⚠️  Google STT initialization failed: {e}. Using mock mode.")
            self.client = None
            self.enabled = False
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en-US") -> str:
        """Transcribe audio bytes to text"""
        if not self.enabled or not self.client:
            # Mock transcription for testing
            return "Hello, I need help finding a station"
        
        try:
            audio = speech.RecognitionAudio(content=audio_data)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language,
            )
            
            response = self.client.recognize(config=config, audio=audio)
            
            if response.results:
                return response.results[0].alternatives[0].transcript
            return ""
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return ""
    
    async def transcribe_stream(self, audio_stream: AsyncIterator[bytes], language: str = "en-US") -> AsyncIterator[str]:
        """Stream transcription for real-time audio"""
        if not self.enabled or not self.client:
            # Mock streaming transcription
            async for chunk in audio_stream:
                yield "Hello"
            return
        
        try:
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language,
                enable_automatic_punctuation=True,
            )
            
            streaming_config = speech.StreamingRecognitionConfig(
                config=config,
                interim_results=True,
            )
            
            # This is a simplified version - in production, you'd handle the stream properly
            async for audio_chunk in audio_stream:
                requests = [speech.StreamingRecognizeRequest(audio_content=audio_chunk)]
                responses = self.client.streaming_recognize(streaming_config, requests)
                
                for response in responses:
                    for result in response.results:
                        if result.alternatives:
                            yield result.alternatives[0].transcript
        except Exception as e:
            print(f"Error in stream transcription: {e}")
            yield ""

class MockSTTAdapter(ASRPort):
    """Mock STT Adapter for testing without Google Cloud - Supports Hindi/English"""
    
    def __init__(self):
        # Simple keyword detection for demo
        self.hindi_keywords = {
            "hello": ["namaste", "namaskar", "kaise ho", "kya haal"],
            "station": ["station", "sthan", "kendra"],
            "help": ["madad", "sahayata", "help"],
            "noida": ["noida"],
            "delhi": ["delhi", "dilli"],
        }
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en-US") -> str:
        """Mock transcription - supports Hindi/English mix"""
        # In real implementation, this would use actual ASR
        # For now, return sample based on language
        if language.startswith("hi"):
            return "नमस्ते, मुझे स्टेशन ढूंढने में मदद चाहिए"
        return "Hello, I need help finding a station"
    
    async def transcribe_stream(self, audio_stream: AsyncIterator[bytes], language: str = "en-US") -> AsyncIterator[str]:
        """Mock streaming transcription with Hindi support"""
        # Simulate real-time transcription
        if language.startswith("hi"):
            yield "नमस्ते"
            yield "मुझे मदद चाहिए"
        else:
            yield "Hello"
            yield "I need help"
