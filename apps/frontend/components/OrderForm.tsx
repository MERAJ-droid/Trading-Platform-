'use client';

import { useState } from 'react';
import { tradingApi } from '@/lib/api';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

interface OrderFormProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  onOrderSubmit: () => void;
}

export default function OrderForm({ symbol, onSymbolChange, onOrderSubmit }: OrderFormProps) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await tradingApi.createOrder({
        symbol,
        side,
        type,
        quantity: parseFloat(quantity),
        price: type === 'LIMIT' ? parseFloat(price) : undefined,
      });

      setMessage('Order submitted successfully!');
      setQuantity('');
      setPrice('');
      onOrderSubmit();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Place Order</h2>

      {message && (
        <div className={`p-3 rounded text-sm ${
          message.includes('success') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Symbol Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500"
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-2 rounded font-medium ${
              side === 'BUY'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-2 rounded font-medium ${
              side === 'SELL'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Order Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'MARKET' | 'LIMIT')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500"
          >
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            step="any"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500"
            placeholder="0.001"
          />
        </div>

        {/* Price (for LIMIT orders) */}
        {type === 'LIMIT' && (
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              step="any"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded font-medium transition-colors ${
            side === 'BUY'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } disabled:opacity-50`}
        >
          {loading ? 'Submitting...' : `${side} ${symbol}`}
        </button>
      </form>
    </div>
  );
}
