# Environment Variables for Railway Deployment

## Redis URL (for all services)
```
REDIS_URL=redis://default:NUSEFrtAa6ouUXc8P2PSEoyDqgWjn5f5@redis-15690.c301.ap-south-1-1.ec2.cloud.redislabs.com:15690
```

## For Backend API Gateway Service

```
PORT=3001
DATABASE_URL=postgresql://postgres:AGoNkhEXrgaPZmxmQVlQOndtJYyKSlum@postgres.railway.internal:5432/railway
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
REDIS_URL=redis://default:NUSEFrtAa6ouUXc8P2PSEoyDqgWjn5f5@redis-15690.c301.ap-south-1-1.ec2.cloud.redislabs.com:15690
CORS_ORIGIN=*
BINANCE_API_URL=https://testnet.binance.vision
```

## For Execution Service

```
DATABASE_URL=postgresql://postgres:AGoNkhEXrgaPZmxmQVlQOndtJYyKSlum@postgres.railway.internal:5432/railway
REDIS_URL=redis://default:NUSEFrtAa6ouUXc8P2PSEoyDqgWjn5f5@redis-15690.c301.ap-south-1-1.ec2.cloud.redislabs.com:15690
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
BINANCE_API_URL=https://testnet.binance.vision
```

## For Event Service

```
PORT=3003
REDIS_URL=redis://default:NUSEFrtAa6ouUXc8P2PSEoyDqgWjn5f5@redis-15690.c301.ap-south-1-1.ec2.cloud.redislabs.com:15690
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
CORS_ORIGIN=*
```

## For Frontend (Vercel)

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_WS_URL=https://your-event-service-url.railway.app
```

---

**Note:** Replace the JWT_SECRET with a secure random string in production!
