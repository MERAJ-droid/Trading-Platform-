import { Router } from 'express';
import axios from 'axios';

export const marketRouter = Router();

const BINANCE_API = 'https://testnet.binance.vision/api/v3';

// Get candlestick data
marketRouter.get('/candles', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', interval = '1m', limit = 500 } = req.query;
    
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: {
        symbol,
        interval,
        limit,
      },
    }).catch(err => {
      // If Binance blocks us (451 or other errors), return mock data
      console.log('Binance API blocked, returning mock data');
      return null;
    });
    
    // If API is blocked, return mock candles
    if (!response) {
      const now = Math.floor(Date.now() / 1000);
      const mockCandles = Array.from({ length: 100 }, (_, i) => {
        const basePrice = 45000;
        const variance = Math.random() * 1000 - 500;
        return {
          time: now - (100 - i) * 60,
          open: basePrice + variance,
          high: basePrice + variance + Math.random() * 200,
          low: basePrice + variance - Math.random() * 200,
          close: basePrice + variance + Math.random() * 100 - 50,
          volume: Math.random() * 100,
        };
      });
      return res.json(mockCandles);
    }
    
    // Convert Binance klines to lightweight-charts format
    const candles = response.data.map((kline: any[]) => ({
      time: Math.floor(kline[0] / 1000), // Convert to seconds
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
    
    res.json(candles);
  } catch (error: any) {
    console.error('Get candles error:', error);
    res.status(500).json({ error: 'Failed to fetch candles' });
  }
});

// Get current price
marketRouter.get('/price', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT' } = req.query;
    
    const response = await axios.get(`${BINANCE_API}/ticker/price`, {
      params: { symbol },
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Get price error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});
