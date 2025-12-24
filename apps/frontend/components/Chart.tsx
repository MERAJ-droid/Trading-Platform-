'use client';

import { useEffect, useRef, useState } from 'react';
import { marketApi } from '@/lib/api';

interface ChartProps {
  symbol: string;
}

export default function Chart({ symbol }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchCandles = async () => {
      try {
        const data = await marketApi.getCandles(symbol, '1m', 100);
        setCandles(data);
        if (data.length > 0) {
          setCurrentPrice(data[data.length - 1].close);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch candles:', err);
        setError('Failed to load chart data');
      }
    };

    fetchCandles();
    interval = setInterval(fetchCandles, 10000);

    return () => clearInterval(interval);
  }, [symbol]);

  const lastCandle = candles[candles.length - 1];
  const priceChange = lastCandle && candles.length > 1 
    ? lastCandle.close - candles[0].open 
    : 0;
  const priceChangePercent = lastCandle && candles.length > 1
    ? ((priceChange / candles[0].open) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{symbol}</h2>
        {currentPrice && (
          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-3xl font-bold">${currentPrice.toFixed(2)}</span>
            <span className={`text-lg ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChangePercent}%
            </span>
          </div>
        )}
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-red-400">
          {error}
        </div>
      ) : candles.length > 0 ? (
        <div 
          ref={chartContainerRef} 
          className="flex-1 bg-gray-800 rounded-lg p-4 overflow-hidden"
        >
          <div className="h-full flex items-end justify-between gap-1">
            {candles.slice(-50).map((candle, index) => {
              const isGreen = candle.close >= candle.open;
              const high = candle.high;
              const low = candle.low;
              const maxPrice = Math.max(...candles.slice(-50).map((c: any) => c.high));
              const minPrice = Math.min(...candles.slice(-50).map((c: any) => c.low));
              const range = maxPrice - minPrice;
              
              const bodyTop = Math.max(candle.open, candle.close);
              const bodyBottom = Math.min(candle.open, candle.close);
              
              const bodyHeight = range > 0 ? ((bodyTop - bodyBottom) / range) * 100 : 1;
              const bodyBottom_pct = range > 0 ? ((bodyBottom - minPrice) / range) * 100 : 0;
              const wickTop_pct = range > 0 ? ((high - minPrice) / range) * 100 : 100;
              const wickBottom_pct = range > 0 ? ((low - minPrice) / range) * 100 : 0;
              
              return (
                <div 
                  key={index} 
                  className="flex-1 relative h-full"
                  style={{ minWidth: '2px', maxWidth: '20px' }}
                >
                  {/* Wick */}
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 w-px"
                    style={{
                      backgroundColor: isGreen ? '#10b981' : '#ef4444',
                      bottom: `${wickBottom_pct}%`,
                      height: `${wickTop_pct - wickBottom_pct}%`
                    }}
                  />
                  {/* Body */}
                  <div 
                    className="absolute left-0 right-0"
                    style={{
                      backgroundColor: isGreen ? '#10b981' : '#ef4444',
                      bottom: `${bodyBottom_pct}%`,
                      height: `${Math.max(bodyHeight, 0.5)}%`,
                      minHeight: '1px'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading chart data...
        </div>
      )}
    </div>
  );
}
