import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "voiceboat"))

from src.core.conversation.orchestrator import ConversationOrchestrator
from src.adapters.mock_adapters import MockNLUAdapter, MockBackendAdapter, MockHandoffAdapter

async def run_test():
    nlu = MockNLUAdapter()
    backend = MockBackendAdapter()
    handoff = MockHandoffAdapter()
    orchestrator = ConversationOrchestrator(nlu, backend, handoff)

    conv_id = "test_123"

    print("--- Test 1: Find Station (Missing Slot) ---")
    res1 = await orchestrator.handle_message(conv_id, "Find nearest station")
    print(f"Bot: {res1.text}")

    print("\n--- Test 2: Provide Location (Slot Filling) ---")
    res2 = await orchestrator.handle_message(conv_id, "I am in Noida")
    print(f"Bot: {res2.text}")

    print("\n--- Test 3: Swap History (Full Intent) ---")
    res3 = await orchestrator.handle_message(conv_id, "Show my swap history for yesterday")
    print(f"Bot: {res3.text}")

    print("\n--- Test 4: Escalation (Angry User) ---")
    res4 = await orchestrator.handle_message(conv_id, "This is a bad service, I am angry")
    print(f"Bot: {res4.text}")
    print(f"Escalated: {res4.needs_escalation}")

if __name__ == "__main__":
    asyncio.run(run_test())
