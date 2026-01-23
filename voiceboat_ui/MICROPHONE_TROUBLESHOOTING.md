# Microphone Access Troubleshooting Guide

## Common Issues and Solutions

### 1. "Could not access microphone" Error

#### Solution A: Check Browser Permissions
1. **Chrome/Edge:**
   - Click the lock icon (🔒) in the address bar
   - Find "Microphone" and set to "Allow"
   - Refresh the page

2. **Firefox:**
   - Click the shield icon in address bar
   - Click "Permissions" → "Use the Microphone" → "Allow"
   - Refresh the page

3. **Safari:**
   - Safari → Settings → Websites → Microphone
   - Find your site and set to "Allow"

#### Solution B: Check HTTPS/Localhost
- ✅ **Works:** `https://your-site.com` or `http://localhost:5173`
- ❌ **Doesn't work:** `http://192.168.1.100:5173` (non-localhost HTTP)

**Fix:** Use `localhost` instead of IP address, or set up HTTPS

#### Solution C: Check System Permissions

**macOS:**
- System Settings → Privacy & Security → Microphone
- Ensure your browser is allowed

**Windows:**
- Settings → Privacy → Microphone
- Ensure "Allow apps to access your microphone" is ON
- Ensure your browser is allowed

**Linux:**
- Check PulseAudio/ALSA permissions
- Ensure microphone is not muted

### 2. "Microphone is being used by another application"

**Solution:**
- Close other apps using microphone (Zoom, Teams, Discord, etc.)
- Check system audio settings
- Restart browser if needed

### 3. "No microphone found"

**Solution:**
- Check if microphone is connected
- Test microphone in system settings
- Try a different microphone
- Check browser console for device list

### 4. Browser Compatibility

**Supported Browsers:**
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Edge 79+
- ✅ Safari 11+ (with limitations)
- ❌ Internet Explorer (not supported)

### 5. Codec/Format Issues

The app automatically tries multiple audio formats:
- `audio/webm;codecs=opus` (preferred)
- `audio/webm`
- `audio/mp4`
- `audio/ogg;codecs=opus`
- `audio/wav`

If recording works but processing fails, check backend logs.

## Quick Test

1. **Test microphone in browser:**
   ```javascript
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(stream => console.log("Microphone works!", stream))
     .catch(err => console.error("Error:", err));
   ```
   Run this in browser console (F12)

2. **Check available devices:**
   ```javascript
   navigator.mediaDevices.enumerateDevices()
     .then(devices => {
       const audioInputs = devices.filter(d => d.kind === 'audioinput');
       console.log("Available microphones:", audioInputs);
     });
   ```

## Still Not Working?

1. **Clear browser cache and cookies**
2. **Try incognito/private mode**
3. **Update browser to latest version**
4. **Try a different browser**
5. **Restart computer** (sometimes fixes permission issues)
6. **Check browser console** (F12) for detailed error messages

## Development Tips

### For Local Development:
- Always use `localhost` (not IP address)
- Use `http://localhost:5173` (Vite dev server)
- Chrome DevTools → Application → Permissions → Microphone → Allow

### For Production:
- Must use HTTPS
- Set proper CORS headers
- Configure browser permissions properly

## Testing Checklist

- [ ] Browser supports getUserMedia
- [ ] Using HTTPS or localhost
- [ ] Browser permissions granted
- [ ] System permissions granted
- [ ] Microphone is connected and working
- [ ] No other app using microphone
- [ ] Browser is up to date
- [ ] Tried different browser

---

**Need more help?** Check browser console (F12) for detailed error messages.
