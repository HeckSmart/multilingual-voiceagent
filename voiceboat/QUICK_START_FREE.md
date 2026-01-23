# 🆓 Quick Start - FREE Options (No Payment!)

## ✅ Good News: It Works FREE Right Now!

Your voicebot **already works** without any API keys! It uses:
- ✅ **Enhanced keyword-based ASR** (FREE, no API needed)
- ✅ **Enhanced keyword-based NLU** (FREE, no API needed)
- ✅ **Browser TTS** (FREE, built-in)

## 🚀 Just Start It!

```bash
cd voiceboat
python3 -m uvicorn src.api.main:app --reload
```

**That's it!** No API keys needed for basic functionality.

---

## 🎯 Want Better Accuracy? Use FREE APIs

### Option 1: Deepgram (Best Free Tier) ⭐

**FREE: 12,000 minutes/month (200 hours!)**

1. **Sign up:** https://deepgram.com/
2. **Get API key:** Dashboard → API Keys
3. **Add to `.env`:**
   ```env
   DEEPGRAM_API_KEY=your-key-here
   ```
4. **Restart backend** - Automatically uses Deepgram!

---

### Option 2: AssemblyAI

**FREE: 5 hours/month**

1. **Sign up:** https://www.assemblyai.com/
2. **Get API key:** Dashboard → API Keys  
3. **Add to `.env`:**
   ```env
   ASSEMBLYAI_API_KEY=your-key-here
   ```
4. **Restart backend** - Automatically uses AssemblyAI!

---

## 📊 What You Get

### Without API Keys (Default):
- ✅ Works immediately
- ✅ Understands Hindi/English keywords
- ✅ Detects: "station", "swap history", "hello kya jarurat hai"
- ⚠️ Less accurate than real ASR

### With Free API Keys:
- ✅ **Much better accuracy**
- ✅ Real speech-to-text
- ✅ Handles accents, background noise
- ✅ Production-ready

---

## 🎯 Recommended Setup

### For Testing/Demos:
**Use default (no API keys needed)** - Works perfectly!

### For Production:
**Add Deepgram API key** - Best free tier (200 hours/month)

---

## 📝 Signup Links

- **Deepgram:** https://deepgram.com/ (12,000 min/month FREE)
- **AssemblyAI:** https://www.assemblyai.com/ (5 hours/month FREE)

**No credit card required for free tiers!** 🎉

---

## ✅ Test It Now

1. **Start backend** (no API keys needed):
   ```bash
   cd voiceboat
   python3 -m uvicorn src.api.main:app --reload
   ```

2. **Start frontend:**
   ```bash
   cd voiceboat_ui
   npm run dev
   ```

3. **Test:** Go to `http://localhost:5173/driver` and click phone button!

**Your voicebot works FREE right now!** 🚀
