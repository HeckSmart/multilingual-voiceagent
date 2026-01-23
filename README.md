# Voiceboat: Production-Grade Voice AI Platform

## 🚀 Overview

Voiceboat is a complete, production-ready voice AI platform designed for driver support. It features a **monolithic Python backend** using Hexagonal Architecture and a modern **React TypeScript frontend** with real-time chat capabilities.

## 🏗️ Architecture

### Backend (Python)
- **Hexagonal Architecture**: Clean separation between business logic and external integrations
- **Core**: Conversation orchestrator with state management
- **Ports**: Abstract interfaces for NLU, Backend APIs, and Handoff services
- **Adapters**: Mock implementations ready to swap with real services

### Frontend (React + TypeScript)
- **Modern React**: Built with React 19, TypeScript, and Vite
- **UI Components**: Radix UI components with Tailwind CSS
- **Real-time Chat**: Interactive chat interface for drivers
- **Agent Dashboard**: Comprehensive dashboard for support agents

## 📂 Project Structure

```
voiceboat_complete_code_clean/
├── voiceboat/                    # Python Backend
│   ├── src/
│   │   ├── api/                 # FastAPI routes
│   │   ├── core/                # Business logic
│   │   │   └── conversation/    # Orchestrator
│   │   ├── ports/               # Interfaces (Hexagonal Architecture)
│   │   ├── adapters/            # Implementations
│   │   └── models/              # Data schemas
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
└── voiceboat_ui/                 # React Frontend
    ├── client/                   # React app source
    │   ├── src/
    │   │   ├── pages/           # Route pages
    │   │   ├── components/      # React components
    │   │   └── ...
    │   └── index.html
    ├── server/                   # Express server
    │   ├── index.ts
    │   └── voicebot_api.ts
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance async web framework
- **Pydantic**: Data validation and settings
- **Python 3.11+**: Modern type-safe Python

### Frontend
- **React 19**: Latest React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Wouter**: Lightweight routing
- **Express**: Node.js server for production

## 🚦 Getting Started

### Prerequisites
- **Python 3.11+** (for backend)
- **Node.js 20+** (for frontend, Node 18 may work but not recommended)
- **npm** or **pnpm** (pnpm recommended)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd voiceboat
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the API server**:
   ```bash
   uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

4. **Test the backend** (optional):
   ```bash
   python test_flow.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd voiceboat_ui
   ```

2. **Install dependencies**:
   ```bash
   # Using npm (if pnpm is not available)
   npm install --legacy-peer-deps
   
   # OR using pnpm (recommended)
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   # Using npm
   npm run dev
   
   # OR using pnpm
   pnpm dev
   ```

   The UI will be available at `http://localhost:5173`

### Running Both Services

**Terminal 1 - Backend**:
```bash
cd voiceboat
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd voiceboat_ui
npm run dev  # or pnpm dev
```

## 📱 Usage

### Driver Chat Interface
1. Navigate to `http://localhost:5173/driver`
2. Start chatting with the AI assistant
3. Try queries like:
   - "Find nearest station in Noida"
   - "Show my swap history"
   - "Check my subscription"

### Agent Dashboard
1. Navigate to `http://localhost:5173/agent`
2. View escalated conversations
3. Monitor sentiment and metrics
4. Assign and resolve escalations

## 🏭 Production Build

### Backend
```bash
cd voiceboat
docker build -t voiceboat:latest .
docker run -p 8000:8000 voiceboat:latest
```

### Frontend
```bash
cd voiceboat_ui
npm run build  # or pnpm build
npm start      # or pnpm start
```

The production server runs on port 3000 by default.

## 🔧 Configuration

### Environment Variables (Frontend)
Create a `.env` file in `voiceboat_ui/`:
```env
VITE_API_URL=http://localhost:8000
VITE_OAUTH_PORTAL_URL=your-oauth-url
VITE_APP_ID=your-app-id
```

### API Endpoints

**Backend (Python FastAPI)**:
- `POST /chat` - Send message to orchestrator
- `GET /health` - Health check

**Frontend Server (Express)**:
- `POST /api/chat` - Chat endpoint
- `GET /api/conversations/:id` - Get conversation
- `GET /api/escalations` - Get escalations
- `POST /api/escalations/:id/assign` - Assign escalation
- `POST /api/escalations/:id/resolve` - Resolve escalation

## 🏛️ Architecture Details

### Hexagonal Architecture (Backend)

The backend uses **Ports and Adapters** pattern:

- **Ports** (`src/ports/interfaces.py`): Abstract interfaces
  - `NLUPort`: Natural Language Understanding
  - `BackendPort`: Backend API services
  - `HandoffPort`: Agent escalation

- **Adapters** (`src/adapters/`): Concrete implementations
  - `MockNLUAdapter`: Mock NLU for testing
  - `MockBackendAdapter`: Mock backend APIs
  - `MockHandoffAdapter`: Mock escalation handler

- **Core** (`src/core/conversation/`): Business logic
  - `ConversationOrchestrator`: Main conversation handler

### Benefits
- ✅ Easy to swap implementations (e.g., replace mock NLU with OpenAI)
- ✅ Testable: Mock adapters for unit tests
- ✅ Maintainable: Core logic independent of external services

## 📈 Features

### Backend
- ✅ **Stateless Design**: Ready for Redis-backed sessions
- ✅ **Confidence Logic**: Escalates when confidence is low
- ✅ **Sentiment Detection**: Immediate escalation for angry users
- ✅ **Slot Filling**: Multi-turn conversations
- ✅ **Intent Recognition**: Supports multiple intents

### Frontend
- ✅ **Real-time Chat**: Interactive chat interface
- ✅ **Agent Dashboard**: Monitor and manage escalations
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Modern UI**: Beautiful, accessible components
- ✅ **Error Handling**: Graceful error boundaries

## 🐛 Troubleshooting

### Frontend shows blank screen
- ✅ **Fixed**: Created `vite.config.ts` and `tsconfig.json`
- ✅ **Fixed**: Fixed missing `@shared/const` import in `const.ts`
- Make sure you're running `npm run dev` from `voiceboat_ui/` directory

### Port already in use
- Backend: Change port with `--port 8001`
- Frontend: Vite will automatically use next available port

### Node version issues
- Upgrade to Node.js 20+ for best compatibility
- Or use `--legacy-peer-deps` flag with npm

### Module resolution errors
- Make sure `vite.config.ts` exists in `voiceboat_ui/`
- Check that `tsconfig.json` has correct path aliases

## 📚 API Documentation

### Backend API (FastAPI)
Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

### Example Request
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "conv_123",
    "text": "Find nearest station in Noida"
  }'
```

## 🤝 Contributing

1. Follow the Hexagonal Architecture pattern for backend
2. Use TypeScript strict mode for frontend
3. Write tests for new features
4. Update this README for significant changes

## 📄 License

MIT License

## 🎙️ Voice Integration (Twilio)

Voiceboat now supports **voice calls** via Twilio! 

### Quick Start with Voice

1. **Set up Twilio** (see `voiceboat/TWILIO_SETUP.md` for detailed instructions):
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Set environment variables
   export TWILIO_ACCOUNT_SID=your_account_sid
   export TWILIO_AUTH_TOKEN=your_auth_token
   export TWILIO_PHONE_NUMBER=+1234567890
   ```

2. **Test Voice in UI**:
   - Go to `/driver` page
   - Click the microphone button 🎤
   - Speak your query
   - Bot will transcribe, process, and respond

3. **Test Phone Calls**:
   - Set up webhook URL (use ngrok for local testing)
   - Call your Twilio number
   - Speak to the bot!

### Voice Flow

```
Caller → Twilio → Webhook → ASR → NLU → Bot → TTS → Twilio → Caller
```

**UI Voice Flow:**
```
User clicks mic → Records audio → ASR → NLU → Bot → TTS → Play audio
```

### Current Implementation

- ✅ **Mock ASR/TTS**: Works without external services (for testing)
- ✅ **Twilio Integration**: Ready for real phone calls
- ✅ **UI Voice Button**: Test voice interaction in browser
- ✅ **WebSocket Support**: Real-time audio streaming (ready)

### Production Setup

For production, configure:
- **ASR**: Google Cloud Speech-to-Text or Deepgram
- **TTS**: Google Cloud Text-to-Speech or ElevenLabs
- **Telephony**: Twilio (configured)

See `voiceboat/TWILIO_SETUP.md` for detailed setup instructions.

## 🎯 Next Steps

- [x] ✅ Voice integration with Twilio
- [x] ✅ UI voice interaction component
- [ ] Integrate real NLU service (OpenAI, Rasa, etc.)
- [ ] Add Redis for session management
- [ ] Implement real backend API integrations
- [ ] Add authentication and authorization
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive test coverage

---

**Built with ❤️ using Hexagonal Architecture and Modern React**

npm run dev