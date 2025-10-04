# AI Calling Agent - Frontend

Production-ready Next.js frontend for AI Calling Agent system.

## Tech Stack

- Next.js 14+
- TypeScript
- Tailwind CSS
- Axios for API calls

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable components
- `src/lib/api/` - Centralized API layer
- `src/lib/hooks/` - Custom React hooks
- `src/lib/store/` - State management
- `src/styles/` - Global styles

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Features

- 🔐 Authentication
- 📞 Call Management
- 🤖 AI Agent Configuration
- 📊 Analytics Dashboard
- 🎯 Campaign Management
- ⚡ Real-time Updates

## API Integration

All API calls are centralized in `src/lib/api/services/`. Each service module corresponds to a backend module.

Example usage:

```typescript
import { callsService } from "@/lib/api/services/calls.service";

const calls = await callsService.getAllCalls();
```
