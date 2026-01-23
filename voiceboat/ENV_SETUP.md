# Environment Variables Setup

## ✅ What's Created

1. **`.env`** - Your actual environment file (add your keys here)
2. **`.env.example`** - Template file (safe to commit to Git)
3. **`HOW_TO_GET_OPENAI_KEY.md`** - Step-by-step guide

## 🚀 Quick Setup

### Step 1: Get OpenAI API Key

**Full guide:** See `HOW_TO_GET_OPENAI_KEY.md`

**Quick steps:**
1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Add payment method (required, but you get $5 free credit!)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Step 2: Add to .env File

1. Open `voiceboat/.env` file
2. Find: `OPENAI_API_KEY=`
3. Paste your key:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
4. Save the file

### Step 3: Restart Backend

```bash
cd voiceboat
python3 -m uvicorn src.api.main:app --reload
```

You should see:
```
✅ Using OpenAI Whisper (ASR) + GPT (NLU)
```

## 📝 .env File Structure

```env
# Required for natural conversation
OPENAI_API_KEY=sk-your-key-here

# Optional - for phone calls
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Optional - for Google Cloud ASR/TTS
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_PROJECT_ID=

# Optional - for Deepgram ASR
DEEPGRAM_API_KEY=
```

## 🔒 Security

- ✅ `.env` file is **NOT** committed to Git (safe)
- ✅ `.env.example` is a template (safe to commit)
- ❌ **Never share your API keys** publicly
- ❌ **Never commit `.env`** to Git

## ✅ Verify It Works

1. Add API key to `.env`
2. Start backend
3. Check logs for: `✅ Using OpenAI Whisper (ASR) + GPT (NLU)`
4. Test in UI - bot should understand natural language!

## 🐛 Troubleshooting

**"OpenAI API key not configured"**
- Check `.env` file exists in `voiceboat/` folder
- Check key starts with `sk-`
- Restart backend after adding key

**"Invalid API key"**
- Make sure you copied the full key
- Check for extra spaces
- Verify key is active in OpenAI dashboard

---

**That's it! Your `.env` is ready! 🎉**
