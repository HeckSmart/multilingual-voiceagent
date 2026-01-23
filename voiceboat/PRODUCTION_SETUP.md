# Production Setup Guide - Real ASR/TTS Integration

## 🎯 Production-Ready Implementation

This guide shows how to set up **real** ASR and TTS services for production use, replacing the mock adapters.

## 🔧 Option 1: Google Cloud Speech-to-Text & Text-to-Speech

### Setup Steps:

1. **Install Google Cloud SDK:**
   ```bash
   pip install google-cloud-speech google-cloud-texttospeech
   ```

2. **Set up Google Cloud credentials:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
   export GOOGLE_PROJECT_ID="your-project-id"
   ```

3. **Update `src/api/main.py`:**
   ```python
   from src.adapters.asr_adapters import GoogleSTTAdapter
   from src.adapters.tts_adapters import GoogleTTSAdapter
   
   # Replace mock adapters
   asr = GoogleSTTAdapter()  # Real Google Cloud STT
   tts = GoogleTTSAdapter()  # Real Google Cloud TTS
   ```

4. **Enable APIs in Google Cloud Console:**
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API

### Features:
- ✅ Supports Hindi (`hi-IN`) and English (`en-US`)
- ✅ High accuracy
- ✅ Real-time streaming support
- ✅ Production-grade reliability

---

## 🔧 Option 2: Deepgram (Recommended for Real-time)

### Setup Steps:

1. **Install Deepgram SDK:**
   ```bash
   pip install deepgram-sdk
   ```

2. **Create Deepgram adapter:**
   ```python
   # src/adapters/deepgram_adapter.py
   from deepgram import DeepgramClient, PrerecordedOptions
   from src.ports.interfaces import ASRPort
   from src.config.settings import settings
   
   class DeepgramSTTAdapter(ASRPort):
       def __init__(self):
           self.client = DeepgramClient(settings.DEEPGRAM_API_KEY)
       
       async def transcribe_audio(self, audio_data: bytes, language: str = "en-US"):
           options = PrerecordedOptions(
               model="nova-2",
               language=language,
               smart_format=True
           )
           response = self.client.listen.rest.v("1").transcribe_file(
               {"buffer": audio_data},
               options
           )
           return response.results.channels[0].alternatives[0].transcript
   ```

3. **Set API key:**
   ```bash
   export DEEPGRAM_API_KEY="your-deepgram-api-key"
   ```

### Features:
- ✅ Excellent real-time performance
- ✅ Supports Hindi and English
- ✅ Low latency
- ✅ Great for production

---

## 🔧 Option 3: AssemblyAI

### Setup Steps:

1. **Install AssemblyAI:**
   ```bash
   pip install assemblyai
   ```

2. **Create adapter:**
   ```python
   import assemblyai as aai
   from src.ports.interfaces import ASRPort
   
   class AssemblyAIAdapter(ASRPort):
       def __init__(self):
           aai.settings.api_key = settings.ASSEMBLYAI_API_KEY
           self.transcriber = aai.Transcriber()
       
       async def transcribe_audio(self, audio_data: bytes, language: str = "en-US"):
           config = aai.TranscriptionConfig(language_code=language)
           result = self.transcriber.transcribe(audio_data, config)
           return result.text
   ```

---

## 🎙️ Voice Activity Detection (VAD)

The system now includes **production-ready VAD** that:
- ✅ Detects actual speech vs silence
- ✅ Analyzes audio levels (RMS)
- ✅ Uses zero-crossing rate for speech detection
- ✅ Prevents false positives from background noise

**Already implemented** in `src/core/voice/voice_activity_detector.py`

---

## 📞 Proactive Interaction

The bot now **proactively speaks** when:
1. No speech detected in audio (silence)
2. User doesn't respond for 3+ seconds
3. Empty transcription received

**Prompts:**
- Hindi: "मैं सुन रहा हूं, बोलिए?", "क्या आप वहाँ हैं?"
- English: "I'm listening, go ahead?", "Are you there?"

---

## 🚀 Production Deployment Checklist

### Backend:
- [ ] Set up real ASR service (Google/Deepgram/AssemblyAI)
- [ ] Set up real TTS service (Google/ElevenLabs)
- [ ] Configure environment variables
- [ ] Set up Twilio webhook URLs
- [ ] Enable HTTPS (required for production)
- [ ] Set up Redis for session storage
- [ ] Configure logging and monitoring

### Frontend:
- [ ] Update API URL to production endpoint
- [ ] Enable HTTPS
- [ ] Test microphone permissions
- [ ] Test voice synthesis in production browser

### Testing:
- [ ] Test Hindi speech recognition
- [ ] Test English speech recognition
- [ ] Test proactive prompts
- [ ] Test voice activity detection
- [ ] Test error handling
- [ ] Load testing

---

## 🔑 Environment Variables

Create `.env` file:

```bash
# Google Cloud (Option 1)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
GOOGLE_PROJECT_ID=your-project-id

# Deepgram (Option 2)
DEEPGRAM_API_KEY=your-api-key

# AssemblyAI (Option 3)
ASSEMBLYAI_API_KEY=your-api-key

# Twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Server
SERVER_URL=https://your-domain.com
WEBHOOK_BASE_URL=https://your-domain.com
```

---

## 💡 Recommended Setup for Production

**Best combination:**
- **ASR**: Deepgram (fastest, best real-time)
- **TTS**: Google Cloud TTS (best Hindi support)
- **Telephony**: Twilio (reliable, well-documented)

**Cost-effective:**
- **ASR**: Google Cloud Speech-to-Text
- **TTS**: Google Cloud Text-to-Speech
- **Telephony**: Twilio

---

## 🐛 Troubleshooting

**VAD not detecting speech?**
- Check audio levels in console
- Adjust `silence_threshold` in VAD
- Ensure microphone is working

**Proactive prompts too frequent?**
- Adjust `max_silence_duration` in VAD
- Increase no-response timer (currently 3 seconds)

**ASR not working?**
- Check API credentials
- Verify API quotas
- Check network connectivity

---

**Now your voicebot is production-ready! 🚀**
