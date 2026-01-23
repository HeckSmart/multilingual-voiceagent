"""
Natural Response Generator - Makes bot talk like a human friend
Uses GPT to generate casual, conversational responses
"""
from typing import Optional
import openai
from src.config.settings import settings

class NaturalResponseGenerator:
    """Generates natural, human-like responses using GPT"""
    
    def __init__(self):
        api_key = settings.OPENAI_API_KEY
        if api_key:
            self.client = openai.OpenAI(api_key=api_key)
            self.enabled = True
        else:
            self.client = None
            self.enabled = False
    
    async def generate_response(
        self,
        user_message: str,
        intent: str,
        entities: dict,
        conversation_history: list,
        language: str = "hi"
    ) -> str:
        """Generate natural, casual response like a friend would talk"""
        
        if not self.enabled or not self.client:
            # Fallback to template-based responses
            return self._fallback_response(intent, entities, language)
        
        try:
            # Build conversation context
            history_text = "\n".join([
                f"User: {h.get('user', '')}" for h in conversation_history[-3:]
            ])
            
            # System prompt for casual, friendly conversation - like friends talking
            system_prompt = f"""You are a friendly, casual voice assistant for drivers. Talk EXACTLY like a normal friend would - casual, natural, helpful.

CRITICAL RULES:
- Use CASUAL language ONLY (like friends talking on phone)
- NEVER use formal words: "जी", "बताइए", "कृपया", "आप" (use "तू/तुम" casually)
- Use natural casual words: "हैलो", "ठीक है", "मिल गया", "चलो", "बताओ", "देखता हूं"
- Keep responses VERY SHORT (max 1 sentence, 5-10 words)
- Be friendly like a friend, not a formal assistant
- Use Hinglish naturally: "station chahiye", "kya help", "location kya hai"
- Sound like you're talking to a friend, not a customer

Language: {"Hindi/Hinglish - talk casually" if language == "hi" else "English - talk casually"}

GOOD examples (casual, friendly):
- "हैलो! क्या चाहिए?"
- "ठीक है, बताओ कहाँ हो?"
- "मिल गया! नोएडा में Station है"
- "चलो, देखता हूं"
- "बताओ location क्या है?"

BAD examples (too formal - DON'T USE):
- "नमस्ते जी! कृपया बताइए" ❌
- "मैं आपकी कैसे सहायता कर सकता हूं?" ❌
- "कृपया अपना स्थान बताएं" ❌
- "आप किस एरिया में हैं?" ❌

Talk like a friend, not a robot!"""
            
            # Build user prompt
            user_prompt = f"""User said: "{user_message}"

Intent: {intent}
Entities: {entities}
Previous conversation:
{history_text}

Generate a natural, casual response (1-2 sentences, friendly tone):"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.9,  # More creative, natural, casual
                max_tokens=50  # Keep it short and casual
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            # Clean up response
            generated_text = generated_text.replace('"', '').strip()
            
            return generated_text
            
        except Exception as e:
            print(f"Error generating natural response: {e}")
            return self._fallback_response(intent, entities, language)
    
    def _fallback_response(self, intent: str, entities: dict, language: str) -> str:
        """Fallback casual responses"""
        import random
        
        if language == "hi":
            if intent == "FIND_NEAREST_STATION":
                if not entities.get("location"):
                    return random.choice([
                        "ठीक है, बताओ कहाँ हो?",
                        "चलो, किस जगह पर हो?",
                        "बताओ location क्या है?",
                    ])
                else:
                    loc = entities["location"]
                    return random.choice([
                        f"मिल गया! {loc} में Station {loc} है",
                        f"ठीक है, {loc} में nearest station Station {loc} है",
                        f"चलो, {loc} में Station {loc} मिलेगा",
                    ])
            
            if intent == "GET_SWAP_HISTORY":
                if not entities.get("date_range"):
                    return random.choice([
                        "किस दिन का देखना है?",
                        "कब का history चाहिए?",
                        "बताओ किस date का?",
                    ])
                else:
                    return random.choice([
                        "चलो देखता हूं... कल 3 swaps हुए थे",
                        "ठीक है, कल 3 swaps मिले",
                        "मिल गया! कल 3 swaps थे",
                    ])
            
            # Default casual responses
            return random.choice([
                "हैलो! क्या चाहिए?",
                "बताओ, क्या help चाहिए?",
                "चलो, क्या जरूरत है?",
            ])
        else:
            # English casual responses
            if intent == "FIND_NEAREST_STATION":
                if not entities.get("location"):
                    return random.choice([
                        "Sure, where are you?",
                        "Okay, what's your location?",
                        "Tell me, where are you?",
                    ])
                else:
                    loc = entities["location"]
                    return random.choice([
                        f"Got it! Station {loc} is in {loc}",
                        f"Okay, nearest station in {loc} is Station {loc}",
                        f"Found it! Station {loc} in {loc}",
                    ])
            
            return random.choice([
                "Hey! What do you need?",
                "What's up? How can I help?",
                "Sure, what do you want?",
            ])
