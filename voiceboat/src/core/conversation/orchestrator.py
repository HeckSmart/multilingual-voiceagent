from typing import Dict, Any, Optional
import random
from src.models.schemas import (
    ConversationState, NLUResult, IntentType, 
    ConversationStatus, ActionResponse, Sentiment
)
from src.ports.interfaces import NLUPort, BackendPort, HandoffPort
from src.core.conversation.natural_response_generator import NaturalResponseGenerator

class ConversationOrchestrator:
    def __init__(
        self, 
        nlu_adapter: NLUPort, 
        backend_adapter: BackendPort, 
        handoff_adapter: HandoffPort
    ):
        self.nlu = nlu_adapter
        self.backend = backend_adapter
        self.handoff = handoff_adapter
        self.response_generator = NaturalResponseGenerator()
        # In production, this would be a Redis-backed store
        self.sessions: Dict[str, ConversationState] = {}

    async def handle_message(self, conversation_id: str, text: str, language: str = "en") -> ActionResponse:
        # 1. Get or create session
        state = self.sessions.get(conversation_id)
        is_new_conversation = False
        if not state:
            state = ConversationState(conversation_id=conversation_id)
            self.sessions[conversation_id] = state
            is_new_conversation = True

        # 2. NLU Analysis
        nlu_result = await self.nlu.analyze_text(text)
        state.history.append({"user": text})
        
        # 3. Handle new conversation greeting - Natural and interactive
        if is_new_conversation:
            # Check if user just said hello/greeting (including Hinglish like "hello kya jarurat hai")
            text_lower = text.lower()
            greetings = [
                "hello", "hi", "namaste", "namaskar", "kaise ho", "hey", "hii",
                "hello kya", "hello kya jarurat", "hello kya chahiye",
                "नमस्ते", "नमस्कार", "हैलो"
            ]
            
            # Check for greeting patterns (including "hello kya jarurat hai" type)
            is_greeting = any(greeting in text_lower for greeting in greetings) or \
                         ("jarurat" in text_lower or "chahiye" in text_lower) or \
                         ("kya" in text_lower and ("help" in text_lower or "madad" in text_lower))
            
            # Generate natural greeting response
            greeting_response = await self.response_generator.generate_response(
                user_message=text,
                intent="GREETING",
                entities={},
                conversation_history=[],
                language=language
            )
            
            if greeting_response:
                return ActionResponse(
                    text=greeting_response,
                    should_end=False
                )
            
            # Fallback casual greetings
            if language == "hi" or any(ord(char) >= 0x0900 and ord(char) <= 0x097F for char in text):
                return ActionResponse(
                    text=random.choice([
                        "हैलो! क्या चाहिए?",
                        "हैलो! बताओ क्या help चाहिए?",
                        "हैलो! क्या जरूरत है?",
                    ]),
                    should_end=False
                )
            else:
                return ActionResponse(
                    text=random.choice([
                        "Hey! What do you need?",
                        "Hello! What's up?",
                        "Hi! How can I help?",
                    ]),
                    should_end=False
                )

        # 3. Check for immediate escalation (Sentiment or explicit request)
        if nlu_result.sentiment == Sentiment.ANGRY or "agent" in text.lower() or "एजेंट" in text:
            return await self._escalate(state, "User requested agent or is angry", language)

        # 4. Confidence Logic - Natural responses
        if nlu_result.confidence < 0.6:
            state.retry_count += 1
            if state.retry_count > 2:
                return await self._escalate(state, "Low confidence after multiple attempts", language)
            
            # Generate natural unclear response
            unclear_response = await self.response_generator.generate_response(
                user_message=text,
                intent="UNKNOWN",
                entities={},
                conversation_history=state.history[-2:],
                language=language
            )
            
            if unclear_response:
                return ActionResponse(text=unclear_response)
            
            # Fallback casual unclear responses
            if language == "hi":
                return ActionResponse(text=random.choice([
                    "अरे, साफ नहीं सुनाई दिया। दोबारा बोलो?",
                    "क्या फिर से बोल सकते हो?",
                    "समझ नहीं आया, थोड़ा साफ बोलो?",
                ]))
            else:
                return ActionResponse(text=random.choice([
                    "Sorry, didn't catch that. Can you repeat?",
                    "What was that? Say again?",
                    "Didn't get it, can you say it again?",
                ]))

        # 5. Intent Handling & Slot Filling
        if nlu_result.intent != IntentType.UNKNOWN:
            state.current_intent = nlu_result.intent
        
        state.slots.update(nlu_result.entities)

        if not state.current_intent:
            # Generate natural unsure response
            unsure_response = await self.response_generator.generate_response(
                user_message=text,
                intent="UNKNOWN",
                entities={},
                conversation_history=state.history[-2:],
                language=language
            )
            
            if unsure_response:
                return ActionResponse(text=unsure_response)
            
            # Fallback casual unsure responses
            if language == "hi":
                return ActionResponse(text=random.choice([
                    "क्या चाहिए? Station चाहिए या कुछ और?",
                    "बताओ, क्या help चाहिए?",
                    "क्या जरूरत है? Station या swap history?",
                ]))
            else:
                return ActionResponse(text=random.choice([
                    "What do you need? Station or something else?",
                    "Tell me, what do you want?",
                    "What are you looking for? Station?",
                ]))

        return await self._process_intent(state, language)

    async def _process_intent(self, state: ConversationState, language: str = "en") -> ActionResponse:
        intent = state.current_intent

        if intent == IntentType.FIND_NEAREST_STATION:
            if "location" not in state.slots:
                # Generate natural follow-up
                follow_up = await self.response_generator.generate_response(
                    user_message=text,
                    intent="FIND_NEAREST_STATION",
                    entities={},
                    conversation_history=state.history[-2:],
                    language=language
                )
                
                if follow_up:
                    return ActionResponse(text=follow_up)
                
                # Fallback casual follow-ups
                if language == "hi":
                    return ActionResponse(text=random.choice([
                        "ठीक है, बताओ कहाँ हो?",
                        "चलो, किस जगह पर हो?",
                        "बताओ location क्या है?",
                    ]))
                else:
                    return ActionResponse(text=random.choice([
                        "Sure, where are you?",
                        "Okay, what's your location?",
                        "Tell me, where are you?",
                    ]))
            
            # Get station info
            station = await self.backend.find_nearest_station(state.slots["location"])
            
            # Generate natural response with station info
            station_response = await self.response_generator.generate_response(
                user_message=text,
                intent="FIND_NEAREST_STATION",
                entities={"location": state.slots["location"], "station_name": station['name'], "station_address": station['address']},
                conversation_history=state.history[-2:],
                language=language
            )
            
            if station_response:
                return ActionResponse(
                    text=station_response,
                    should_end=False
                )
            
            # Fallback casual responses
            if language == "hi":
                return ActionResponse(
                    text=random.choice([
                        f"मिल गया! {state.slots['location']} में {station['name']} है, {station['address']} पर",
                        f"ठीक है, {station['name']} स्टेशन {station['address']} पर मिलेगा",
                        f"चलो, {station['name']} है {station['address']} पर",
                    ]),
                    should_end=False
                )
            else:
                return ActionResponse(
                    text=random.choice([
                        f"Got it! {station['name']} is at {station['address']} in {state.slots['location']}",
                        f"Found it! {station['name']} station at {station['address']}",
                        f"Okay, {station['name']} is at {station['address']}",
                    ]),
                    should_end=False
                )

        if intent == IntentType.GET_SWAP_HISTORY:
            if "date_range" not in state.slots:
                # Generate natural follow-up
                follow_up = await self.response_generator.generate_response(
                    user_message=text,
                    intent="GET_SWAP_HISTORY",
                    entities={},
                    conversation_history=state.history[-2:],
                    language=language
                )
                
                if follow_up:
                    return ActionResponse(text=follow_up)
                
                # Fallback casual follow-ups
                if language == "hi":
                    return ActionResponse(text=random.choice([
                        "किस दिन का देखना है?",
                        "कब का history चाहिए?",
                        "बताओ किस date का?",
                    ]))
                else:
                    return ActionResponse(text=random.choice([
                        "Which day?",
                        "What date?",
                        "When do you want to see?",
                    ]))
            
            # Get history
            history = await self.backend.get_swap_history("driver_123", state.slots["date_range"])
            
            # Generate natural response with history
            history_response = await self.response_generator.generate_response(
                user_message=text,
                intent="GET_SWAP_HISTORY",
                entities={"date_range": state.slots["date_range"], "swap_count": len(history), "last_swap_time": history[0]['time'] if history else "N/A"},
                conversation_history=state.history[-2:],
                language=language
            )
            
            if history_response:
                return ActionResponse(
                    text=history_response,
                    should_end=False
                )
            
            # Fallback casual responses
            if language == "hi":
                return ActionResponse(
                    text=random.choice([
                        f"चलो देखता हूं... {len(history)} swaps हुए थे, आखिरी {history[0]['time']} पर",
                        f"ठीक है, {len(history)} swaps मिले, last one {history[0]['time']} पर था",
                        f"मिल गया! {len(history)} swaps थे, latest {history[0]['time']} पर",
                    ]),
                    should_end=False
                )
            else:
                return ActionResponse(
                    text=random.choice([
                        f"Got it! {len(history)} swaps that day, last one at {history[0]['time']}",
                        f"Found {len(history)} swaps, latest was at {history[0]['time']}",
                        f"Okay, {len(history)} swaps, last at {history[0]['time']}",
                    ]),
                    should_end=False
                )

        # Default fallback
        return await self._escalate(state, "Unsupported intent or complex query", language)

    async def _escalate(self, state: ConversationState, reason: str, language: str = "en") -> ActionResponse:
        state.status = ConversationStatus.ESCALATED
        summary = {
            "reason": reason,
            "intent": state.current_intent,
            "slots": state.slots,
            "history": state.history
        }
        await self.handoff.escalate_to_agent(state.conversation_id, summary)
        
        # Generate natural escalation message
        escalation_response = await self.response_generator.generate_response(
            user_message=text,
            intent="ESCALATE",
            entities={},
            conversation_history=state.history[-2:],
            language=language
        )
        
        if escalation_response:
            return ActionResponse(
                text=escalation_response,
                needs_escalation=True
            )
        
        # Fallback casual escalation
        if language == "hi":
            return ActionResponse(
                text=random.choice([
                    "ठीक है, मैं आपको agent से connect कर रहा हूं, wait करो",
                    "चलो, agent से बात करवाता हूं, थोड़ा wait करो",
                    "Agent से connect कर रहा हूं, line पर रहो",
                ]),
                needs_escalation=True
            )
        return ActionResponse(
            text=random.choice([
                "Okay, connecting you to an agent, hold on",
                "Let me connect you to someone who can help, wait a sec",
                "Transferring to agent, stay on the line",
            ]),
            needs_escalation=True
        )
