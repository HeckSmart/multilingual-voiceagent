# Twilio Setup Guide

## Quick Setup for Hackathon

### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account (includes $15.50 credit)
3. Verify your phone number

### 2. Get Your Credentials
1. Go to Twilio Console Dashboard
2. Copy your **Account SID** and **Auth Token**
3. Buy a phone number (or use trial number for testing)

### 3. Configure Environment Variables

Create a `.env` file in the `voiceboat/` directory:

```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
WEBHOOK_BASE_URL=https://your-domain.com  # or use ngrok for local testing
```

### 4. Set Up Webhook URL

For local development, use **ngrok**:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start your FastAPI server
cd voiceboat
uvicorn src.api.main:app --host 0.0.0.0 --port 8000

# In another terminal, expose it
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### 5. Configure Twilio Webhook

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Under "Voice & Fax", set:
   - **A CALL COMES IN**: `https://your-ngrok-url.ngrok.io/twilio/voice`
   - **STATUS CALLBACK URL**: `https://your-ngrok-url.ngrok.io/twilio/status`

### 6. Test the Integration

1. Call your Twilio number
2. You should hear: "Hello! Welcome to Voiceboat. How can I help you today?"
3. Speak your query
4. The bot will process and respond

## Architecture Flow

```
Caller → Twilio Number → Webhook (/twilio/voice) 
  → Voice Orchestrator → ASR → NLU → Bot Logic → TTS → Twilio → Caller
```

## Testing Without Twilio

The system includes **mock adapters** that work without Twilio credentials:
- Mock STT: Returns sample transcribed text
- Mock TTS: Returns empty audio (text response still works)
- Mock Telephony: Logs actions instead of making real calls

## Production Deployment

For production:
1. Use a proper domain (not ngrok)
2. Set up SSL certificate
3. Configure Twilio webhook to production URL
4. Use real ASR/TTS services (Google Cloud, Deepgram, etc.)
5. Set up proper error handling and logging

## Troubleshooting

**No audio response?**
- Check if TTS adapter is configured
- Verify audio format compatibility
- Check browser console for errors

**Webhook not receiving calls?**
- Verify ngrok URL is correct
- Check Twilio webhook configuration
- Ensure server is running and accessible

**Permission denied for microphone?**
- Check browser permissions
- Use HTTPS (required for getUserMedia)
- Test in Chrome/Firefox (best support)
