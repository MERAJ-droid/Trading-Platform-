# Quick Start - Run the Project NOW!

## Prerequisites Check

✅ Node.js installed
✅ Database created
✅ .env files created

## What You Need Right Now

### 1. Start Redis (REQUIRED)

**Option A: Docker (Easiest - 10 seconds)**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Option B: No Docker? Use Redis Cloud (2 minutes)**
1. Go to: https://redis.com/try-free/
2. Create free account
3. Create database
4. Copy connection string
5. Update `REDIS_URL` in:
   - `apps/backend/.env`
   - `apps/execution-service/.env`
   - `apps/event-service/.env`

**Option C: Install Redis locally (Windows)**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

### 2. Get Binance Testnet API Keys (2 minutes)

1. Go to: https://testnet.binance.vision/
2. Click "Register" (top right)
3. Complete registration
4. Go to API Management
5. Generate API Key + Secret
6. **SAVE THESE** - you'll need them when registering in the app

### 3. Start All Services (4 terminals)

Open 4 separate terminal windows:

**Terminal 1: API Gateway**
```bash
cd "c:\Users\Meraj\Desktop\PROJECTS\fullstack-assignment-numatix-MERAJ-droid"
npm run dev:backend
```
Wait for: `🚀 API Gateway running on port 3001`

**Terminal 2: Execution Service**
```bash
cd "c:\Users\Meraj\Desktop\PROJECTS\fullstack-assignment-numatix-MERAJ-droid"
npm run dev:execution
```
Wait for: `👂 Listening for order commands on Redis channel`

**Terminal 3: Event Service**
```bash
cd "c:\Users\Meraj\Desktop\PROJECTS\fullstack-assignment-numatix-MERAJ-droid"
npm run dev:event
```
Wait for: `🚀 Event Service running on port 3003`

**Terminal 4: Frontend**
```bash
cd "c:\Users\Meraj\Desktop\PROJECTS\fullstack-assignment-numatix-MERAJ-droid"
npm run dev:frontend
```
Wait for: `✓ Ready on http://localhost:3000`

### 4. Test the Application

1. **Open browser:** http://localhost:3000
2. **Click "Register"**
3. **Fill in:**
   - Email: your email
   - Password: min 8 characters
   - Binance API Key: (from step 2)
   - Binance Secret: (from step 2)
4. **Click Register** → should redirect to trade page
5. **Place a test order:**
   - Symbol: BTCUSDT
   - Click "Buy"
   - Quantity: 0.001
   - Click "BUY BTCUSDT"
6. **Watch for:**
   - Green dot (WebSocket connected)
   - Order appears in "Recent Orders" table
   - Status changes: PENDING → FILLED (2-3 seconds)
   - Position appears in "Positions" table

## Troubleshooting

### "Redis connection error"
- Redis not running. Run: `docker run -d -p 6379:6379 redis:latest`
- Or update REDIS_URL in .env files to use Redis Cloud

### "Module not found"
```bash
npm install --workspaces
```

### Frontend shows blank page
- Check browser console for errors
- Verify .env.local has correct URLs
- Restart frontend: Ctrl+C, then `npm run dev:frontend`

### Order stuck on PENDING
- Check execution-service terminal for errors
- Verify Binance API keys are correct
- Check you have testnet funds (Binance Testnet gives you free test BTC)

### Can't login after register
- Check backend terminal for errors
- Database might not be initialized: `npm run db:push`

## Architecture Flow

```
1. Frontend → Register → API Gateway
2. API Gateway → Store user + encrypted keys → Database
3. Login → Get JWT token → Connect WebSocket
4. Place Order → API Gateway → Publish to Redis
5. Execution Service → Redis → Call Binance API → Publish Event
6. Event Service → Redis Event → Broadcast via WebSocket
7. Frontend → Receive update → Update UI
```

## What's Running Where

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:3001
- **Event Service (WebSocket):** http://localhost:3003
- **Execution Service:** Background (no HTTP server)
- **Redis:** localhost:6379
- **Database:** SQLite file at `packages/database/dev.db`

## Next Steps

Once it's working:
1. Test with different symbols (ETHUSDT, BNBUSDT)
2. Test SELL orders
3. Test LIMIT orders
4. Check positions calculation
5. Test WebSocket reconnection (stop/start event-service)

## Getting Help

Check logs in each terminal for error messages. Most common issues:
- Redis not running
- Wrong Binance API keys
- Missing environment variables
- Port already in use (3000, 3001, 3003)

## Ready for Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to:
- Backend: Railway/Render
- Frontend: Vercel
- Database: PostgreSQL
- Redis: Redis Cloud
