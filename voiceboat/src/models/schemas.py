from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum

class IntentType(str, Enum):
    GET_SWAP_HISTORY = "GetSwapHistory"
    EXPLAIN_INVOICE = "ExplainInvoice"
    FIND_NEAREST_STATION = "FindNearestStation"
    CHECK_AVAILABILITY = "CheckAvailability"
    CHECK_SUBSCRIPTION = "CheckSubscription"
    RENEW_SUBSCRIPTION = "RenewSubscription"
    PRICING_INFO = "PricingInfo"
    LEAVE_INFO = "LeaveInfo"
    FIND_DSK = "FindDSK"
    UNKNOWN = "Unknown"

class Sentiment(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    ANGRY = "angry"

class ConversationStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ESCALATED = "escalated"

class NLUResult(BaseModel):
    intent: IntentType
    confidence: float
    entities: Dict[str, Any] = {}
    sentiment: Sentiment = Sentiment.NEUTRAL

class ConversationState(BaseModel):
    conversation_id: str
    driver_id: Optional[str] = None
    current_intent: Optional[IntentType] = None
    slots: Dict[str, Any] = {}
    status: ConversationStatus = ConversationStatus.ACTIVE
    history: List[Dict[str, str]] = []
    retry_count: int = 0

class ActionResponse(BaseModel):
    text: str
    should_end: bool = False
    needs_escalation: bool = False
    data: Optional[Dict[str, Any]] = None
