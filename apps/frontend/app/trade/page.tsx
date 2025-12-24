'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useWebSocket } from '@/lib/WebSocketContext';
import { tradingApi, marketApi } from '@/lib/api';
import OrderForm from '@/components/OrderForm';
import Chart from '@/components/Chart';
import OrdersTable from '@/components/OrdersTable';
import PositionsTable from '@/components/PositionsTable';

export default function TradePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { connected, orderUpdates } = useWebSocket();
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [orders, setOrders] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchOrders();
    fetchPositions();
  }, [isAuthenticated, router]);

  // Refresh orders and positions when we get updates
  useEffect(() => {
    if (orderUpdates.length > 0) {
      fetchOrders();
      fetchPositions();
    }
  }, [orderUpdates]);

  const fetchOrders = async () => {
    try {
      const data = await tradingApi.getOrders();
      setOrders(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        logout();
      } else {
        console.error('Failed to fetch orders:', error);
      }
    }
  };

  const fetchPositions = async () => {
    try {
      const data = await tradingApi.getPositions();
      setPositions(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        logout();
      } else {
        console.error('Failed to fetch positions:', error);
      }
    }
  };

  const handleOrderSubmit = async () => {
    await fetchOrders();
    await fetchPositions();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Trading Platform</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-[calc(100vh-60px)]">
        {/* Left Panel - Order Form */}
        <div className="bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <OrderForm
            symbol={symbol}
            onSymbolChange={setSymbol}
            onOrderSubmit={handleOrderSubmit}
          />
        </div>

        {/* Right Panel - Chart & Tables */}
        <div className="flex flex-col overflow-hidden">
          {/* Chart */}
          <div className="flex-1 bg-gray-800 border-b border-gray-700 p-4">
            <Chart symbol={symbol} />
          </div>

          {/* Tables */}
          <div className="h-80 bg-gray-900 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">Positions</h3>
              <PositionsTable positions={positions} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
              <OrdersTable orders={orders.slice(0, 10)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
