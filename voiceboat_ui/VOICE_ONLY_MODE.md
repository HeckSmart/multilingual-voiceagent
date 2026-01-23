# Voice-Only Mode - Setup Guide

## ✅ What Changed

The voice call is now **fully voice-based**:
- ✅ Bot **speaks** the greeting automatically (no text)
- ✅ All responses are **voice-only** (no text in chat)
- ✅ Pure voice interaction - like a real phone call

## 🎯 How It Works Now

1. **Click phone button** → Call starts
2. **Bot automatically greets** (speaks):
   - Hindi: "नमस्ते! मैं Voiceboat सहायता हूं..."
   - English: "Hello! I'm Voiceboat support..."
3. **You speak** → Bot listens
4. **Bot responds** (speaks only, no text)
5. **Continuous conversation** - pure voice

## 🔧 Troubleshooting

### Bot Not Speaking?

**Check Browser Console (F12):**
- Look for: "Speech started", "Voices loaded"
- If you see errors, note them

**Common Issues:**

1. **Browser doesn't support Hindi TTS:**
   - Chrome/Edge: Usually works
   - Firefox: Limited Hindi support
   - Safari: May not support Hindi
   - **Solution**: Use Chrome/Edge for best results

2. **Voices not loaded:**
   - Check console for "Available voices"
   - Look for Hindi voices in the list
   - **Solution**: Wait a moment, voices load asynchronously

3. **Speech synthesis blocked:**
   - Some browsers block auto-play
   - **Solution**: Click the phone button again after page loads

4. **Microphone permissions:**
   - Browser must allow microphone
   - **Solution**: Check browser permissions

## 🧪 Testing

1. **Open browser console** (F12)
2. **Click phone button**
3. **Check console logs:**
   ```
   Available voices: [...]
   Voices loaded: X
   Sending greeting...
   Speech started: नमस्ते! मैं Voiceboat...
   Speech ended successfully
   ```

4. **If you see errors**, share them for debugging

## 💡 Tips

- **Use Chrome/Edge** for best Hindi TTS support
- **Allow microphone** when prompted
- **Wait 1-2 seconds** after clicking phone for greeting
- **Check console** if bot doesn't speak

## 🔍 Debug Mode

To see what's happening, check browser console:
- Voice loading status
- Speech synthesis events
- Any errors

---

**The bot should now speak automatically when you click the phone button! 🎤**
