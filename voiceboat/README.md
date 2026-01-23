# Voiceboat: Production-Standard Monolithic Voice AI

## 🚀 Overview
Voiceboat is a scalable, production-grade monolithic application designed for driver support via voice. It leverages **Hexagonal Architecture** to maintain a clean separation between business logic and external integrations (ASR, NLU, Backend APIs).

## 🏗️ Architecture
The system is built as a **Modular Monolith**:
- **Core**: Contains the "Brain" (Conversation Orchestrator, Intent Handlers).
- **Ports**: Defines interfaces for external services.
- **Adapters**: Implements integrations (e.g., Mock adapters for testing, ready for real API swaps).

## 🛠️ Tech Stack
- **FastAPI**: High-performance asynchronous web framework.
- **Pydantic**: Strict data validation and settings management.
- **Python 3.11**: Modern, type-safe implementation.

## 📂 Project Structure
```text
/src
  /api              # FastAPI routes and entry points
  /core             # Domain logic (The "Brain")
    /conversation   # State machine and orchestration
  /ports            # Abstract interfaces (Hexagonal Ports)
  /adapters         # Concrete implementations (Adapters)
  /models           # Data schemas and types
```

## 🚦 Getting Started
1. **Install Dependencies**:
   ```bash
   pip install fastapi uvicorn pydantic
   ```
2. **Run the API**:
   ```bash
   uvicorn src.api.main:app --reload
   ```
3. **Test the Flow**:
   ```bash
   python test_flow.py
   ```

## 📈 Scalability & Production Standards
- **Stateless Design**: All session data can be moved to Redis for horizontal scaling.
- **Confidence Logic**: Prevents bot loops by escalating to humans when confused.
- **Sentiment Awareness**: Detects angry users and triggers immediate warm handoff.
- **Modular Ports**: Easily swap NLU providers (e.g., Rasa to OpenAI) without touching core logic.

pip3 install -r requirements.txt