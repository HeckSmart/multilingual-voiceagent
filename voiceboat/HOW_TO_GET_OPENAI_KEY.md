# How to Get OpenAI API Key

## 🎯 Step-by-Step Guide

### Step 1: Create OpenAI Account

1. Go to **https://platform.openai.com/**
2. Click **"Sign up"** (or **"Log in"** if you already have an account)
3. Sign up with your email or Google/Microsoft account

### Step 2: Add Payment Method (Required)

OpenAI requires a payment method to use the API (even for free tier):

1. After logging in, go to **Settings** → **Billing**
2. Click **"Add payment method"**
3. Add your credit/debit card
4. **Don't worry** - OpenAI gives you **$5 free credit** to start!

### Step 3: Get Your API Key

1. Go to **https://platform.openai.com/api-keys**
2. Click **"+ Create new secret key"**
3. Give it a name (e.g., "Voiceboat")
4. Click **"Create secret key"**
5. **⚠️ IMPORTANT:** Copy the key immediately! It starts with `sk-` and looks like:
   ```
   sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   **You won't be able to see it again!**

### Step 4: Add to Your .env File

1. Open `voiceboat/.env` file
2. Find the line: `OPENAI_API_KEY=`
3. Paste your key:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
4. Save the file

### Step 5: Restart Backend

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd voiceboat
python3 -m uvicorn src.api.main:app --reload
```

You should see:
```
✅ Using OpenAI Whisper (ASR) + GPT (NLU)
```

## 💰 Pricing

### Whisper (Speech-to-Text):
- **$0.006 per minute** of audio
- Very affordable!

### GPT-4o-mini (NLU):
- **~$0.15 per 1M input tokens**
- **~$0.60 per 1M output tokens**
- Very cost-effective!

### Estimated Cost:
- **1000 calls/day** (avg 2 min each) = **~$12/day** for Whisper
- NLU: **~$1-2/day**
- **Total: ~$13-14/day** for 1000 calls

**You get $5 free credit to start!**

## 🔒 Security Tips

1. **Never commit `.env` file to Git** (it's already in `.gitignore`)
2. **Don't share your API key** publicly
3. **Rotate keys** if exposed
4. **Set usage limits** in OpenAI dashboard

## ✅ Verify It's Working

1. Set your API key in `.env`
2. Start backend
3. Check logs - should see: `✅ Using OpenAI Whisper (ASR) + GPT (NLU)`
4. Test in UI - bot should understand natural language!

## 🐛 Troubleshooting

**"OpenAI API key not configured"**
- Check `.env` file exists in `voiceboat/` folder
- Check key starts with `sk-`
- Restart backend after adding key

**"Invalid API key"**
- Make sure you copied the full key (it's long!)
- Check for extra spaces
- Verify key is active in OpenAI dashboard

**"Insufficient credits"**
- Add payment method in OpenAI dashboard
- Check billing page for usage

---

**That's it! You're ready to use OpenAI! 🚀**
