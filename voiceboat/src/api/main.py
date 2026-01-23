from fastapi import FastAPI, HTTPException, Request, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import Response, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import base64
import time
from src.core.conversation.orchestrator import ConversationOrchestrator
from src.core.voice.voice_orchestrator import VoiceOrchestrator
from src.adapters.mock_adapters import MockNLUAdapter, MockBackendAdapter, MockHandoffAdapter
from src.adapters.asr_adapters import MockSTTAdapter
from src.adapters.tts_adapters import MockTTSAdapter
from src.adapters.twilio_adapter import TwilioAdapter
from src.adapters.openai_adapters import WhisperSTTAdapter, OpenAILNUAdapter
from src.config.settings import settings

app = FastAPI(title="Voiceboat API", version="1.0.0")

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency Injection - Try free options first, then paid
# Priority: Free APIs > OpenAI > Mocks

# Check for free ASR options
if settings.DEEPGRAM_API_KEY:
    from src.adapters.free_adapters import DeepgramFreeAdapter
    print("✅ Using Deepgram ASR (FREE: 12,000 min/month)")
    asr = DeepgramFreeAdapter()
elif settings.ASSEMBLYAI_API_KEY:
    from src.adapters.free_adapters import AssemblyAIAdapter
    print("✅ Using AssemblyAI ASR (FREE: 5 hours/month)")
    asr = AssemblyAIAdapter()
elif settings.OPENAI_API_KEY:
    print("✅ Using OpenAI Whisper ASR")
    asr = WhisperSTTAdapter()
else:
    print("✅ Using Enhanced Keyword-Based ASR (FREE, no API needed)")
    asr = MockSTTAdapter()

# Check for NLU options
if settings.OPENAI_API_KEY:
    print("✅ Using OpenAI GPT NLU")
    nlu = OpenAILNUAdapter()
else:
    from src.adapters.free_adapters import HuggingFaceNLUAdapter
    print("✅ Using Enhanced Keyword-Based NLU (FREE, no API needed)")
    nlu = HuggingFaceNLUAdapter()

# Backend and handoff (always use mocks for now)
backend = MockBackendAdapter()
handoff = MockHandoffAdapter()
conversation_orchestrator = ConversationOrchestrator(nlu, backend, handoff)

# Voice components
tts = MockTTSAdapter()  # Browser TTS is used, but can be replaced with OpenAI TTS
telephony = TwilioAdapter()
voice_orchestrator = VoiceOrchestrator(conversation_orchestrator, asr, tts, telephony)

class MessageRequest(BaseModel):
    conversation_id: str
    text: str
    language: Optional[str] = "en"

class VoiceRequest(BaseModel):
    conversation_id: str
    audio_data: str  # Base64 encoded audio
    language: Optional[str] = "en-US"

@app.post("/chat")
async def chat(request: MessageRequest):
    """Handle text chat messages from driver"""
    try:
        response = await conversation_orchestrator.handle_message(
            request.conversation_id, 
            request.text,
            request.language
        )
        
        # Format response to match frontend expectations
        return {
            "message": {
                "id": f"bot-{int(time.time() * 1000)}",
                "text": response.text,
                "timestamp": int(time.time() * 1000)
            },
            "shouldEscalate": response.needs_escalation,
            "intent": response.intent if hasattr(response, 'intent') else None,
            "confidence": response.confidence if hasattr(response, 'confidence') else 0.8
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice/process")
async def process_voice(request: VoiceRequest):
    """Process voice input and return audio response"""
    try:
        # Decode base64 audio
        audio_data = base64.b64decode(request.audio_data)
        
        result = await voice_orchestrator.process_voice_input(
            request.conversation_id,
            audio_data,
            request.language
        )
        
        # Encode response audio to base64
        if result.get("audio"):
            result["audio"] = base64.b64encode(result["audio"]).decode("utf-8")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Twilio Webhook Endpoints
@app.post("/twilio/voice")
async def twilio_voice_webhook(request: Request):
    """Handle incoming Twilio voice call"""
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    from_number = form_data.get("From")
    to_number = form_data.get("To")
    
    result = await voice_orchestrator.handle_incoming_call(call_sid, from_number, to_number)
    
    return Response(content=result["twiml"], media_type="application/xml")

@app.post("/twilio/media-stream")
async def twilio_media_stream(request: Request):
    """Handle Twilio Media Stream WebSocket connection"""
    # This endpoint handles WebSocket connections for real-time audio streaming
    # For now, return a simple response
    return PlainTextResponse("Media stream endpoint")

@app.websocket("/twilio/media-stream-ws")
async def twilio_media_stream_ws(websocket: WebSocket):
    """WebSocket endpoint for Twilio Media Streams"""
    await websocket.accept()
    conversation_id = None
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types from Twilio
            if data.get("event") == "connected":
                print("Twilio Media Stream connected")
            
            elif data.get("event") == "start":
                conversation_id = data.get("streamSid", "unknown")
                print(f"Stream started: {conversation_id}")
            
            elif data.get("event") == "media":
                # Process audio chunk
                payload = data.get("media", {}).get("payload")
                if payload:
                    audio_data = base64.b64decode(payload)
                    result = await voice_orchestrator.process_voice_input(
                        conversation_id or "default",
                        audio_data
                    )
                    
                    # Send response back (simplified - in production, use proper Twilio Media Stream format)
                    if result.get("audio"):
                        await websocket.send_json({
                            "event": "media",
                            "media": {
                                "payload": base64.b64encode(result["audio"]).decode("utf-8")
                            }
                        })
            
            elif data.get("event") == "stop":
                print("Stream stopped")
                break
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Error in media stream: {e}")

@app.get("/health")
async def health():
    return {"status": "healthy", "voice_enabled": True}
