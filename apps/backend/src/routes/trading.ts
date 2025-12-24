import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '@repo/database';
import { CreateOrderSchema } from '@repo/shared';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { publishToRedis } from '../utils/redis';

export const tradingRouter = Router();

// All routes require authentication
tradingRouter.use(authMiddleware);

// Create order (publishes to Redis, does NOT call Binance directly)
tradingRouter.post('/orders', async (req: AuthRequest, res) => {
  try {
    const data = CreateOrderSchema.parse(req.body);
    const userId = req.user!.id;
    const orderId = crypto.randomUUID();
    
    // Store order command in database
    await prisma.orderCommand.create({
      data: {
        orderId,
        userId,
        symbol: data.symbol,
        side: data.side,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        status: 'PENDING',
      },
    });
    
    // Publish to Redis for execution service
    await publishToRedis('commands:order:submit', {
      orderId,
      userId,
      symbol: data.symbol,
      side: data.side,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`📤 Published order ${orderId} to Redis`);
    
    res.json({
      orderId,
      status: 'PENDING',
      message: 'Order submitted for execution',
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

// Get user's orders
tradingRouter.get('/orders', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const orders = await prisma.orderCommand.findMany({
      where: { userId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedOrders = orders.map(order => ({
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
      latestEvent: order.events[0] || null,
    }));
    
    res.json(formattedOrders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get user's positions
tradingRouter.get('/positions', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Get all filled orders
    const filledEvents = await prisma.orderEvent.findMany({
      where: {
        userId,
        status: 'FILLED',
      },
      include: {
        order: true,
      },
    });
    
    // Calculate positions by symbol
    const positionsMap = new Map<string, { quantity: number; totalCost: number }>();
    
    for (const event of filledEvents) {
      const symbol = event.symbol;
      const quantity = event.side === 'BUY' ? event.quantity : -event.quantity;
      const cost = (event.price || 0) * event.quantity;
      
      if (!positionsMap.has(symbol)) {
        positionsMap.set(symbol, { quantity: 0, totalCost: 0 });
      }
      
      const pos = positionsMap.get(symbol)!;
      pos.quantity += quantity;
      pos.totalCost += event.side === 'BUY' ? cost : -cost;
    }
    
    // Format positions
    const positions = Array.from(positionsMap.entries())
      .filter(([_, pos]) => Math.abs(pos.quantity) > 0.0001) // Filter out zero positions
      .map(([symbol, pos]) => ({
        symbol,
        quantity: pos.quantity,
        averagePrice: pos.totalCost / Math.abs(pos.quantity),
      }));
    
    res.json(positions);
  } catch (error: any) {
    console.error('Get positions error:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});
