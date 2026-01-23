# Voiceboat UI

React + TypeScript frontend for the Voiceboat voice AI platform.

## Quick Start

### Prerequisites
- Node.js 20+ (Node 18 may work but not recommended)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps
```

Or if you have pnpm:
```bash
pnpm install
```

### Run Development Server

```bash
npm run dev
```

The UI will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm start
```

Production server runs on port 3000.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run preview` - Preview production build
- `npm run check` - Type check TypeScript

## Project Structure

```
voiceboat_ui/
├── client/           # React app source code
│   ├── src/
│   │   ├── pages/    # Route pages (Home, DriverChat, AgentDashboard)
│   │   ├── components/  # React components
│   │   └── ...
│   └── index.html
├── server/           # Express server for production
└── package.json
```

## Troubleshooting

**Blank screen?**
- Make sure you ran `npm install --legacy-peer-deps`
- Check browser console for errors
- Verify `vite.config.ts` exists in root directory

**Port already in use?**
- Vite will automatically use the next available port
- Check terminal output for the actual URL

**Module resolution errors?**
- Delete `node_modules` and run `npm install --legacy-peer-deps` again
- Make sure `vite.config.ts` and `tsconfig.json` exist
