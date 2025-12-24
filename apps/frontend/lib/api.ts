import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    binanceApiKey: string;
    binanceSecretKey: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

// Trading API
export const tradingApi = {
  createOrder: async (data: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_MARKET';
    quantity: number;
    price?: number;
  }) => {
    const response = await api.post('/api/trading/orders', data);
    return response.data;
  },
  
  getOrders: async () => {
    const response = await api.get('/api/trading/orders');
    return response.data;
  },
  
  getPositions: async () => {
    const response = await api.get('/api/trading/positions');
    return response.data;
  },
};

// Market API
export const marketApi = {
  getCandles: async (symbol: string, interval: string = '1m', limit: number = 500) => {
    const response = await api.get('/api/market/candles', {
      params: { symbol, interval, limit },
    });
    return response.data;
  },
  
  getPrice: async (symbol: string) => {
    const response = await api.get('/api/market/price', {
      params: { symbol },
    });
    return response.data;
  },
};
