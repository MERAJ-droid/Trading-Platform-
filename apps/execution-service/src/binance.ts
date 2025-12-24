import axios from 'axios';
import crypto from 'crypto';
import { OrderCommand } from '@repo/shared';

const BINANCE_API_URL = process.env.BINANCE_API_URL || 'https://testnet.binance.vision';

interface BinanceOrderResult {
  status: 'FILLED' | 'REJECTED' | 'PARTIALLY_FILLED';
  price?: number;
  error?: string;
}

function createSignature(queryString: string, apiSecret: string): string {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
}

export async function executeBinanceOrder(
  apiKey: string,
  apiSecret: string,
  order: OrderCommand
): Promise<BinanceOrderResult> {
  try {
    console.log(`🔄 Executing Binance order: ${order.symbol} ${order.side} ${order.quantity}`);
    
    // Prepare order parameters
    const timestamp = Date.now();
    const params: any = {
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      timestamp,
    };
    
    // Add price for LIMIT orders
    if (order.type === 'LIMIT' && order.price) {
      params.price = order.price;
      params.timeInForce = 'GTC';
    }
    
    // Create query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Generate signature
    const signature = createSignature(queryString, apiSecret);
    const signedQueryString = `${queryString}&signature=${signature}`;
    
    // Execute order
    const response = await axios.post(
      `${BINANCE_API_URL}/api/v3/order`,
      null,
      {
        params: { ...params, signature },
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );
    
    console.log('✅ Binance order response:', response.data);
    
    // Parse response
    const binanceStatus = response.data.status;
    let status: 'FILLED' | 'REJECTED' | 'PARTIALLY_FILLED' = 'FILLED';
    
    if (binanceStatus === 'FILLED') {
      status = 'FILLED';
    } else if (binanceStatus === 'PARTIALLY_FILLED') {
      status = 'PARTIALLY_FILLED';
    } else {
      status = 'REJECTED';
    }
    
    // Get execution price
    const price = response.data.fills && response.data.fills[0]
      ? parseFloat(response.data.fills[0].price)
      : order.price;
    
    return {
      status,
      price,
    };
    
  } catch (error: any) {
    console.error('❌ Binance order failed:', error.response?.data || error.message);
    
    return {
      status: 'REJECTED',
      error: error.response?.data?.msg || error.message,
    };
  }
}
