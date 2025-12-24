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
    });
    
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
