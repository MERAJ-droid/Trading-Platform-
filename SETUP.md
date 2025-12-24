# Trading Platform - Setup Instructions

## Quick Start Guide

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

### 2. Setup Environment Files

Copy `.env.example` to `.env` in each service:

**packages/database/.env**
```
DATABASE_URL="file:./dev.db"
```

**apps/backend/.env**
```
PORT=3001
DATABASE_URL="file:../../packages/database/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-CHANGE-THIS"
ENCRYPTION_KEY="32-character-key-for-encryption!!"
REDIS_URL="redis://localhost:6379"
CORS_ORIGIN="http://localhost:3000"
```

**apps/execution-service/.env**
```
DATABASE_URL="file:../../packages/database/dev.db"
REDIS_URL="redis://localhost:6379"
ENCRYPTION_KEY="32-character-key-for-encryption!!"
BINANCE_API_URL="https://testnet.binance.vision"
```

**apps/event-service/.env**
```
PORT=3003
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-CHANGE-THIS"
CORS_ORIGIN="http://localhost:3000"
```

**apps/frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3003
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Start Redis (Local)

**Option A: Docker (Recommended)**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Option B: Local Installation**
- Download from https://redis.io/download
- Or use Redis Cloud (free tier): https://redis.com/try-free/

### 5. Run All Services

Open 4 separate terminals:

**Terminal 1: Backend (API Gateway)**
```bash
npm run dev:backend
```

**Terminal 2: Execution Service**
```bash
npm run dev:execution
```

**Terminal 3: Event Service (WebSocket)**
```bash
npm run dev:event
```

**Terminal 4: Frontend**
```bash
npm run dev:frontend
```

### 6. Access the Application

Open browser: http://localhost:3000

## Architecture

```
Frontend (Next.js) → API Gateway (Express) → Redis (Pub/Sub) → Execution Service (Binance)
       ↑                                                              ↓
       └──────── WebSocket ← Event Service ← Redis (Events) ← Order Events
```

## Binance Testnet Setup

1. Go to: https://testnet.binance.vision/
2. Register an account
3. Generate API keys
4. Use these keys when registering in the app

## Troubleshooting

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping` (should return PONG)
- Check REDIS_URL in .env files

### Database Error
- Run: `npm run db:push`
- Check DATABASE_URL paths are correct

### Frontend Can't Connect
- Verify all services are running
- Check NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL

### Orders Not Executing
- Check execution-service logs
- Verify Binance API keys are correct
- Ensure you have testnet funds

## Testing the Flow

1. Register with your Binance Testnet API keys
2. Login
3. Select BTCUSDT
4. Place a small BUY order (e.g., 0.001 BTC)
5. Watch for:
   - Order status changes from PENDING → FILLED
   - Position appears in Positions table
   - WebSocket connection indicator (green dot)

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## Project Structure

```
trading-platform/
├── apps/
│   ├── backend/          # API Gateway (Express + JWT)
│   ├── execution-service/# Order Execution (Binance API)
│   ├── event-service/    # WebSocket Server
│   └── frontend/         # Next.js UI
├── packages/
│   ├── database/         # Prisma Schema & Client
│   └── shared/           # Shared Types (Zod schemas)
└── package.json          # Workspace config
```

## Key Technologies

- **Backend:** Node.js, Express, Redis, Prisma, JWT
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, lightweight-charts, Socket.IO
- **Database:** SQLite (dev), PostgreSQL (prod)
- **Message Bus:** Redis Pub/Sub
- **WebSocket:** Socket.IO
