'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3003';

interface OrderUpdate {
  orderId: string;
  userId: string;
  status: string;
  symbol: string;
  side: string;
  quantity: number;
  price?: number;
  timestamp: string;
  error?: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  orderUpdates: OrderUpdate[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    console.log('🔌 Connecting to WebSocket...');
    
    const newSocket = io(WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('ORDER_UPDATE', (data: OrderUpdate) => {
      console.log('📥 Order update received:', data);
      setOrderUpdates((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 updates
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      newSocket.close();
    };
  }, [isAuthenticated, token]);

  return (
    <WebSocketContext.Provider value={{ socket, connected, orderUpdates }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
