from typing import Dict, Any, List
from src.ports.interfaces import NLUPort, BackendPort, HandoffPort
from src.models.schemas import NLUResult, IntentType, Sentiment

class MockNLUAdapter(NLUPort):
    """NLU Adapter with Hindi/English support"""
    
    async def analyze_text(self, text: str) -> NLUResult:
        text_lower = text.lower()
        
        # Hindi keywords mapping
        hindi_station_keywords = ["स्टेशन", "sthan", "kendra", "station"]
        hindi_location_keywords = ["noida", "delhi", "gurgaon", "गुरुग्राम", "दिल्ली"]
        hindi_help_keywords = ["madad", "sahayata", "help", "मदद", "सहायता"]
        hindi_swap_keywords = ["swap", "history", "itihas", "इतिहास", "बदलाव"]
        hindi_greetings = ["namaste", "namaskar", "kaise ho", "hello", "hi", "नमस्ते", "नमस्कार"]
        
        # Check for station intent (Hindi + English)
        if any(keyword in text_lower for keyword in hindi_station_keywords) or \
           any(loc in text_lower for loc in hindi_location_keywords):
            entities = {}
            for loc in ["noida", "delhi", "gurgaon", "नोएडा", "दिल्ली"]:
                if loc in text_lower:
                    entities["location"] = loc.capitalize()
            
            intent = IntentType.FIND_NEAREST_STATION if any(kw in text_lower for kw in hindi_station_keywords) else IntentType.UNKNOWN
            return NLUResult(intent=intent, confidence=0.9, entities=entities)
        
        # Check for swap history (Hindi + English)
        if any(keyword in text_lower for keyword in hindi_swap_keywords):
            entities = {}
            if "yesterday" in text_lower or "kal" in text_lower or "कल" in text_lower:
                entities["date_range"] = "yesterday"
            return NLUResult(intent=IntentType.GET_SWAP_HISTORY, confidence=0.85, entities=entities)
        
        # Check for greetings (don't treat as unknown)
        if any(greeting in text_lower for greeting in hindi_greetings):
            return NLUResult(intent=IntentType.UNKNOWN, confidence=0.7, sentiment=Sentiment.POSITIVE)
        
        # Check for negative sentiment
        if "angry" in text_lower or "bad" in text_lower or "गुस्सा" in text_lower:
            return NLUResult(intent=IntentType.UNKNOWN, confidence=0.5, sentiment=Sentiment.ANGRY)

        return NLUResult(intent=IntentType.UNKNOWN, confidence=0.3)

class MockBackendAdapter(BackendPort):
    async def get_swap_history(self, driver_id: str, date_range: str) -> List[Dict[str, Any]]:
        return [{"time": "2026-01-22 14:30", "station": "Station A", "battery_id": "B123"}]

    async def find_nearest_station(self, location: str) -> Dict[str, Any]:
        return {"name": f"Station {location}", "address": f"Main Road, {location}"}

    async def check_subscription(self, driver_id: str) -> Dict[str, Any]:
        return {"status": "active", "expiry": "2026-12-31"}

class MockHandoffAdapter(HandoffPort):
    async def escalate_to_agent(self, conversation_id: str, summary: Dict[str, Any]) -> bool:
        print(f"ESCALATION for {conversation_id}: {summary['reason']}")
        return True
