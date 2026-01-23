# Quick Start - OpenAI Whisper + GPT

## 🚀 Setup in 3 Steps

### 1. Install Dependencies
```bash
cd voiceboat
pip install -r requirements.txt
```

### 2. Set OpenAI API Key
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Start Backend
```bash
uvicorn src.api.main:app --reload
```

You should see:
```
✅ Using OpenAI Whisper (ASR) + GPT (NLU)
```

## 🎯 What It Does

### OpenAI Whisper (ASR):
- ✅ Converts your voice → text
- ✅ Supports Hindi and English
- ✅ Understands Hinglish perfectly
- ✅ High accuracy

### OpenAI GPT (NLU):
- ✅ Understands natural language:
  - "hello kya jarurat hai?" ✅
  - "नमस्ते, मुझे स्टेशन चाहिए" ✅
  - "swap history kal ka" ✅
- ✅ Extracts intent and entities
- ✅ Handles Hinglish queries

## 🧪 Test It

1. **Set API key:**
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

2. **Start backend:**
   ```bash
   uvicorn src.api.main:app --reload
   ```

3. **Start frontend:**
   ```bash
   cd voiceboat_ui
   npm run dev
   ```

4. **Test:**
   - Go to `/driver` page
   - Click phone button
   - Say: **"hello kya jarurat hai?"**
   - Bot understands and responds! 🎉

## 💡 Example Queries

### Hinglish:
- "hello kya jarurat hai?"
- "hello kya chahiye?"
- "namaste, station chahiye"

### Hindi:
- "नमस्ते, मुझे स्टेशन चाहिए"
- "मुझे मदद चाहिए"

### English:
- "Hello, I need a station"
- "What's my swap history?"

## 🔧 Troubleshooting

**Not using OpenAI?**
- Check: `echo $OPENAI_API_KEY`
- Make sure it starts with `sk-`
- Restart backend after setting

**Error transcribing?**
- Check API key is valid
- Check you have OpenAI credits
- Check internet connection

---

**That's it! Your bot now understands "hello kya jarurat hai?" 🚀**
