from typing import Dict, Any
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Stream, Start
from src.ports.interfaces import TelephonyPort
from src.config.settings import settings

class TwilioAdapter(TelephonyPort):
    def __init__(self):
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        else:
            self.client = None
            print("⚠️  Twilio credentials not configured. Using mock mode.")
    
    async def handle_incoming_call(self, call_sid: str, from_number: str, to_number: str) -> Dict[str, Any]:
        """Handle incoming call and return TwiML response"""
        response = VoiceResponse()
        
        # Start media stream to receive audio
        start = Start()
        stream = Stream(url=f"{settings.WEBHOOK_BASE_URL}/twilio/media-stream")
        start.stream(stream)
        response.append(start)
        
        # Say welcome message
        response.say("Hello! Welcome to Voiceboat. How can I help you today?", voice="alice")
        
        return {
            "twiml": str(response),
            "call_sid": call_sid,
            "from": from_number,
            "to": to_number
        }
    
    async def stream_audio_to_call(self, call_sid: str, audio_data: bytes) -> bool:
        """Stream audio to active call using Twilio Media Streams"""
        # In production, this would use Twilio Media Streams WebSocket
        # For now, we'll use TwiML <Say> or <Play> commands
        return True
    
    async def transfer_to_agent(self, call_sid: str, agent_number: str) -> bool:
        """Transfer call to human agent"""
        if not self.client:
            print(f"Mock: Transferring call {call_sid} to {agent_number}")
            return True
        
        try:
            call = self.client.calls(call_sid).update(
                twiml=f'<Response><Dial>{agent_number}</Dial></Response>'
            )
            return True
        except Exception as e:
            print(f"Error transferring call: {e}")
            return False
