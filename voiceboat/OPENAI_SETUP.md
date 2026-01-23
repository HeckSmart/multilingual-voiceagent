# OpenAI Integration Setup - Whisper + GPT

## 🎯 What This Does

- **OpenAI Whisper**: Real Speech-to-Text (supports Hindi/English)
- **OpenAI GPT**: Intelligent NLU that understands natural language like "hello kya jarurat hai?"

## 🚀 Quick Setup

### 1. Install OpenAI SDK

```bash
pip install openai
```

Or it's already in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

### 3. Set Environment Variable

```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

Or create `.env` file:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### 4. Restart Backend

```bash
cd voiceboat
uvicorn src.api.main:app --reload
```

You should see:
```
✅ Using OpenAI Whisper (ASR) + GPT (NLU)
```

## 🎯 How It Works

### Speech-to-Text (Whisper):
- Converts audio → text
- Supports Hindi (`hi`) and English (`en`)
- High accuracy
- Handles Hinglish (Hindi-English mix)

### Natural Language Understanding (GPT):
- Understands natural queries:
  - "hello kya jarurat hai?" → Recognizes as greeting + question
  - "नमस्ते, मुझे स्टेशन चाहिए" → Finds intent: FindNearestStation
  - "swap history kal ka" → Finds intent: GetSwapHistory
- Extracts entities (location, dates, etc.)
- Detects sentiment
- Returns confidence scores

## 📝 Example Queries It Understands

### Hindi/Hinglish:
- "नमस्ते, मुझे नोएडा में स्टेशन चाहिए"
- "hello kya jarurat hai?"
- "swap history कल का"
- "मुझे मदद चाहिए"

### English:
- "Hello, I need a station in Noida"
- "What's my swap history for yesterday?"
- "Check my subscription"

## 🔧 Configuration

The system automatically uses OpenAI if `OPENAI_API_KEY` is set, otherwise falls back to mocks.

### Check if OpenAI is Active:

Look for this in backend logs:
```
✅ Using OpenAI Whisper (ASR) + GPT (NLU)
```

If you see:
```
⚠️  Using Mock adapters. Set OPENAI_API_KEY to use OpenAI.
```

Then OpenAI is not configured.

## 💰 Cost Considerations

### Whisper API:
- $0.006 per minute of audio
- Very affordable for production

### GPT-4o-mini (NLU):
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Very cost-effective for NLU

### Estimated Cost:
- 1000 calls/day (avg 2 min each) = ~$12/day for Whisper
- NLU: ~$1-2/day
- **Total: ~$13-14/day for 1000 calls**

## 🧪 Testing

1. **Set API key:**
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

2. **Start backend:**
   ```bash
   uvicorn src.api.main:app --reload
   ```

3. **Test in UI:**
   - Click phone button
   - Say: "hello kya jarurat hai?"
   - Bot should understand and respond naturally

## 🐛 Troubleshooting

**"OpenAI API key not configured"**
- Check environment variable: `echo $OPENAI_API_KEY`
- Restart backend after setting

**"Error transcribing with Whisper"**
- Check API key is valid
- Check internet connection
- Check OpenAI account has credits

**"Error in OpenAI NLU"**
- Check API key permissions
- Check model availability (gpt-4o-mini)
- Check JSON response format

## 🎯 Benefits

### Before (Mock):
- ❌ Fixed responses
- ❌ Simple keyword matching
- ❌ Doesn't understand "hello kya jarurat hai?"

### After (OpenAI):
- ✅ Understands natural language
- ✅ Handles Hinglish perfectly
- ✅ Extracts entities intelligently
- ✅ High accuracy
- ✅ Production-ready

---

**Your voicebot now understands natural language like "hello kya jarurat hai?" 🚀**
