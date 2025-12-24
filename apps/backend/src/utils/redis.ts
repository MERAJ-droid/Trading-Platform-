import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    
    await redisClient.connect();
  }
  
  return redisClient;
}

export async function publishToRedis(channel: string, message: any) {
  const client = await getRedisClient();
  await client.publish(channel, JSON.stringify(message));
}
