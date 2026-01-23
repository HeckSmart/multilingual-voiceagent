# 🆓 FREE Options for Voicebot - No Payment Required!

## 🎯 Free ASR (Speech-to-Text) Options

### Option 1: AssemblyAI (Recommended) ⭐
**FREE TIER: 5 hours/month**

#### Setup:
1. **Sign up:** https://www.assemblyai.com/
2. **Get API key:** Dashboard → API Keys
3. **Add to `.env`:**
   ```env
   ASSEMBLYAI_API_KEY=your-api-key-here
   ```

#### Features:
- ✅ 5 hours/month FREE
- ✅ Hindi + English support
- ✅ High accuracy
- ✅ Real-time streaming

---

### Option 2: Deepgram ⭐
**FREE TIER: 12,000 minutes/month (200 hours!)**

#### Setup:
1. **Sign up:** https://deepgram.com/
2. **Get API key:** Dashboard → API Keys
3. **Add to `.env`:**
   ```env
   DEEPGRAM_API_KEY=your-api-key-here
   ```

#### Features:
- ✅ **12,000 minutes/month FREE** (best free tier!)
- ✅ Hindi + English support
- ✅ Real-time streaming
- ✅ Very accurate

---

### Option 3: Enhanced Keyword-Based (No API needed!)
**COMPLETELY FREE - No signup required**

Already built-in! Uses smart keyword detection for Hindi/English.

#### Features:
- ✅ **100% FREE** - No API key needed
- ✅ Works offline
- ✅ Hindi + English support
- ⚠️ Less accurate than real ASR (but good for demos)

---

## 🧠 Free NLU (Natural Language Understanding) Options

### Option 1: Enhanced Keyword-Based NLU (Recommended for Free) ⭐
**COMPLETELY FREE - Already implemented!**

#### Features:
- ✅ **100% FREE** - No API needed
- ✅ Understands Hindi/English/Hinglish
- ✅ Detects intents: FindNearestStation, GetSwapHistory, etc.
- ✅ Extracts entities (location, dates)
- ✅ Works offline

#### How it works:
- Smart keyword matching
- Handles: "hello kya jarurat hai?", "station chahiye", "swap history kal ka"
- Already built-in - no setup needed!

---

### Option 2: Hugging Face (Optional)
**FREE - Public API**

#### Setup:
1. **Sign up:** https://huggingface.co/
2. **Get API key:** Settings → Access Tokens
3. **Add to `.env`:**
   ```env
   HUGGINGFACE_API_KEY=your-token-here
   ```

#### Features:
- ✅ FREE public API
- ✅ Many pre-trained models
- ⚠️ Slower than keyword-based
- ⚠️ Rate limits on free tier

---

## 🚀 Quick Setup - Use Free Options

### Step 1: Choose Your Free ASR

**Option A: AssemblyAI (5 hours/month)**
```bash
# Add to voiceboat/.env
ASSEMBLYAI_API_KEY=your-key-here
```

**Option B: Deepgram (200 hours/month)**
```bash
# Add to voiceboat/.env
DEEPGRAM_API_KEY=your-key-here
```

**Option C: Use Keyword-Based (No API needed)**
```bash
# Don't add anything - it's already built-in!
```

### Step 2: Update main.py

Edit `voiceboat/src/api/main.py`:

```python
# For AssemblyAI:
from src.adapters.free_adapters import AssemblyAIAdapter
asr = AssemblyAIAdapter()

# OR for Deepgram:
from src.adapters.free_adapters import DeepgramFreeAdapter
asr = DeepgramFreeAdapter()

# OR use keyword-based (already default):
from src.adapters.asr_adapters import MockSTTAdapter
asr = MockSTTAdapter()  # Enhanced keyword-based
```

### Step 3: Use Free NLU

```python
# Enhanced keyword-based NLU (FREE, already default):
from src.adapters.free_adapters import HuggingFaceNLUAdapter
nlu = HuggingFaceNLUAdapter()  # Uses smart keyword matching

# OR keep the existing mock (also free):
from src.adapters.mock_adapters import MockNLUAdapter
nlu = MockNLUAdapter()
```

### Step 4: Restart Backend

```bash
cd voiceboat
python3 -m uvicorn src.api.main:app --reload
```

---

## 📊 Comparison

| Service | Free Tier | Setup | Accuracy | Best For |
|---------|-----------|-------|----------|----------|
| **Deepgram** | 12,000 min/month | Easy | ⭐⭐⭐⭐⭐ | Production |
| **AssemblyAI** | 5 hours/month | Easy | ⭐⭐⭐⭐⭐ | Testing |
| **Keyword-Based** | Unlimited | None | ⭐⭐⭐ | Demos |

---

## 💡 Recommended Setup (100% Free)

### For Demos/Testing:
```python
# ASR: Enhanced keyword-based (no API needed)
asr = MockSTTAdapter()

# NLU: Enhanced keyword-based (no API needed)
nlu = HuggingFaceNLUAdapter()  # or MockNLUAdapter()
```

### For Production (with free tier):
```python
# ASR: Deepgram (200 hours/month free)
asr = DeepgramFreeAdapter()

# NLU: Enhanced keyword-based
nlu = HuggingFaceNLUAdapter()
```

---

## ✅ What Works Without Any API Keys

- ✅ **Voice call UI** - Works perfectly
- ✅ **Proactive interaction** - Bot speaks when you don't
- ✅ **Keyword-based ASR** - Understands basic Hindi/English
- ✅ **Keyword-based NLU** - Detects intents and entities
- ✅ **Natural responses** - GPT-like responses (if OpenAI key set, otherwise uses templates)

---

## 🎯 Get Started - No Payment Required!

1. **Use keyword-based adapters** (already default)
2. **Test in UI** - Works immediately
3. **Optional:** Add free API keys for better accuracy

**You can use the voicebot RIGHT NOW without any API keys!** 🚀

---

## 📝 Free API Keys Signup Links

- **AssemblyAI:** https://www.assemblyai.com/ (5 hours/month)
- **Deepgram:** https://deepgram.com/ (200 hours/month)
- **Hugging Face:** https://huggingface.co/ (optional, for advanced NLU)

---

**Your voicebot works FREE out of the box! 🎉**
