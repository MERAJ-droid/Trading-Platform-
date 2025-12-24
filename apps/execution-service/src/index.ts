import { createClient } from 'redis';
import dotenv from 'dotenv';
import { prisma } from '@repo/database';
import { OrderCommand } from '@repo/shared';
import { executeBinanceOrder } from './binance';
import { decrypt } from './encryption';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function main() {
  console.log('🚀 Starting Execution Service...');
  
  // Create Redis clients (one for subscribe, one for publish)
  const subscriber = createClient({ url: REDIS_URL });
  const publisher = createClient({ url: REDIS_URL });
  
  await subscriber.connect();
  await publisher.connect();
  
  console.log('✅ Connected to Redis');
  
  // Subscribe to order commands
  await subscriber.subscribe('commands:order:submit', async (message) => {
    try {
      const orderCommand: OrderCommand = JSON.parse(message);
      console.log(`📥 Received order command: ${orderCommand.orderId}`);
      
      // Get user's Binance credentials
      const user = await prisma.user.findUnique({
        where: { id: orderCommand.userId },
      });
      
      if (!user) {
        console.error('User not found:', orderCommand.userId);
        return;
      }
      
      // Decrypt Binance keys
      const apiKey = decrypt(user.binanceApiKeyEnc);
      const apiSecret = decrypt(user.binanceSecretEnc);
      
      // Execute order on Binance
      const result = await executeBinanceOrder(
        apiKey,
        apiSecret,
        orderCommand
      );
      
      // Update order status in database
      await prisma.orderCommand.update({
        where: { orderId: orderCommand.orderId },
        data: { status: result.status },
      });
      
      // Create order event
      await prisma.orderEvent.create({
        data: {
          orderId: orderCommand.orderId,
          userId: orderCommand.userId,
          status: result.status,
          symbol: orderCommand.symbol,
          side: orderCommand.side,
          price: result.price,
          quantity: orderCommand.quantity,
          timestamp: new Date(),
        },
      });
      
      // Publish event to Redis for WebSocket broadcasting
      await publisher.publish('events:order:status', JSON.stringify({
        orderId: orderCommand.orderId,
        userId: orderCommand.userId,
        status: result.status,
        symbol: orderCommand.symbol,
        side: orderCommand.side,
        quantity: orderCommand.quantity,
        price: result.price,
        timestamp: new Date().toISOString(),
        error: result.error,
      }));
      
      console.log(`✅ Order ${orderCommand.orderId} executed: ${result.status}`);
      
    } catch (error) {
      console.error('Error processing order:', error);
    }
  });
  
  console.log('👂 Listening for order commands on Redis channel: commands:order:submit');
}

main().catch(console.error);
