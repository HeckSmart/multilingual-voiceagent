from typing import Optional
from src.ports.interfaces import TTSPort

class GoogleTTSAdapter(TTSPort):
    """Google Cloud Text-to-Speech Adapter - Supports Hindi/English"""
    
    def __init__(self):
        try:
            from google.cloud import texttospeech
            self.client = texttospeech.TextToSpeechClient()
            self.enabled = True
        except ImportError:
            print("⚠️  google-cloud-texttospeech not installed. Using mock mode.")
            self.client = None
            self.enabled = False
        except Exception as e:
            print(f"⚠️  Google TTS initialization failed: {e}. Using mock mode.")
            self.client = None
            self.enabled = False
    
    async def synthesize_speech(self, text: str, language: str = "en-US", voice: str = "default") -> bytes:
        """Convert text to speech audio bytes - supports Hindi"""
        if not self.enabled or not self.client:
            # Return empty audio for mock
            return b""
        
        try:
            # Detect language from text (simple heuristic)
            if any(ord(char) >= 0x0900 and ord(char) <= 0x097F for char in text):
                # Contains Devanagari script (Hindi)
                lang_code = "hi-IN"
            elif language.startswith("hi"):
                lang_code = "hi-IN"
            else:
                lang_code = language
            
            # Set up the text input
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Build the voice request with language-specific voice
            if lang_code == "hi-IN":
                # Use Hindi voice
                voice_config = texttospeech.VoiceSelectionParams(
                    language_code="hi-IN",
                    name="hi-IN-Wavenet-C",  # Female Hindi voice
                    ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
                )
            else:
                voice_config = texttospeech.VoiceSelectionParams(
                    language_code=lang_code,
                    ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
                )
            
            # Select the type of audio file
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000
            )
            
            # Perform the text-to-speech request
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice_config,
                audio_config=audio_config
            )
            
            return response.audio_content
        except Exception as e:
            print(f"Error synthesizing speech: {e}")
            return b""

class MockTTSAdapter(TTSPort):
    """Mock TTS Adapter - returns empty audio for testing (supports Hindi text)"""
    
    async def synthesize_speech(self, text: str, language: str = "en-US", voice: str = "default") -> bytes:
        """Mock TTS - returns empty audio bytes"""
        # In production, you'd use a TTS library that supports Hindi
        # For now, return empty - the text will still be displayed
        print(f"TTS (Mock): Would speak: {text[:50]}...")
        return b""
