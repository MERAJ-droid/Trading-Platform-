import { z } from 'zod';

// Order Command (sent to Redis)
export const OrderCommandSchema = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT', 'STOP_MARKET']),
  quantity: z.number().positive(),
  price: z.number().positive().optional(),
  timestamp: z.string().datetime(),
});

export type OrderCommand = z.infer<typeof OrderCommandSchema>;

// Order Event (sent from execution service)
export const OrderEventSchema = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['FILLED', 'REJECTED', 'PARTIALLY_FILLED', 'CANCELLED']),
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive().optional(),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
});

export type OrderEvent = z.infer<typeof OrderEventSchema>;

// WebSocket Messages
export const WSMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('ORDER_UPDATE'),
    data: OrderEventSchema,
  }),
  z.object({
    type: z.literal('PRICE_UPDATE'),
    data: z.object({
      symbol: z.string(),
      price: z.number(),
      timestamp: z.number(),
    }),
  }),
]);

export type WSMessage = z.infer<typeof WSMessageSchema>;

// API Schemas
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  binanceApiKey: z.string().min(1),
  binanceSecretKey: z.string().min(1),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreateOrderSchema = z.object({
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT', 'STOP_MARKET']),
  quantity: z.number().positive(),
  price: z.number().positive().optional(),
});
