// components/CandleStickChart.jsx
import { useState, useEffect } from 'react';

const CandleStickChart = ({ data, height = 400, color = '#3B82F6' }) => {
  const [isClient, setIsClient] = useState(false);
  const [hoveredCandle, setHoveredCandle] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !data || data.length === 0) {
    return (
      <div className={`h-${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
        <div className="text-gray-500">Loading candlestick chart...</div>
      </div>
    );
  }

  // Calculate chart dimensions
  const prices = data.map(d => [d.low, d.high]).flat();
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  const chartWidth = 1200;
  const chartHeight = 500;
  const padding = 80;
  const candleWidth = 8;
  const availableWidth = chartWidth - padding * 2;
  const candleSpacing = availableWidth / data.length;

  const getX = (index) => padding + (index * candleSpacing) + (candleSpacing / 2);
  const getY = (price) => chartHeight - padding - ((price - minPrice) / priceRange) * (chartHeight - padding * 2);

  // Format time for tooltip
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={`h-${height} bg-gray-900 p-6 rounded-lg border border-gray-700 relative`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Trading View</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Bullish</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Bearish</span>
          </div>
        </div>
      </div>

      <div className="relative h-64">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Price Level Lines */}
          <g className="text-gray-500">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const price = minPrice + (priceRange * ratio);
              const y = getY(price);
              return (
                <g key={`price-level-${i}`}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#4B5563"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding - 45}
                    y={y + 4}
                    textAnchor="end"
                    fill="#9CA3AF"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ₹{price.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Candlesticks */}
          {data.map((candle, index) => {
            const x = getX(index);
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            
            const isBullish = candle.close >= candle.open;
            const candleColor = isBullish ? '#10B981' : '#EF4444';
            const candleHeight = Math.abs(closeY - openY) || 1;
            const candleY = isBullish ? closeY : openY;

            return (
              <g 
                key={index}
                onMouseEnter={() => setHoveredCandle({ ...candle, index, x, y: candleY })}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-pointer"
              >
                {/* High-Low line (Wick) */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth="1.5"
                />
                
                {/* Candle body */}
                <rect
                  x={x - candleWidth / 2}
                  y={candleY}
                  width={candleWidth}
                  height={candleHeight}
                  fill={candleColor}
                  stroke={candleColor}
                  strokeWidth="1"
                  rx="1"
                />

                {/* Hover effect */}
                {hoveredCandle?.index === index && (
                  <rect
                    x={x - candleWidth}
                    y={highY - 5}
                    width={candleWidth * 2}
                    height={lowY - highY + 10}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    rx="2"
                  />
                )}
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="#6B7280"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#6B7280"
            strokeWidth="1"
          />

          {/* Time labels */}
          {data.filter((_, i) => i % 5 === 0).map((candle, i) => {
            const index = i * 5;
            const x = getX(index);
            return (
              <text
                key={`time-${i}`}
                x={x}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="10"
                fontFamily="monospace"
              >
                {formatTime(candle.time).split(' ')[0]}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredCandle && (
          <div 
            className="absolute bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-xs shadow-2xl z-10"
            style={{
              left: `${(hoveredCandle.x / chartWidth) * 100}%`,
              top: `${(hoveredCandle.y / chartHeight) * 100 - 10}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-mono space-y-1">
              <div className="text-gray-400">{formatTime(hoveredCandle.time)}</div>
              <div className="flex justify-between space-x-4">
                <div>
                  <div className="text-gray-400">O:</div>
                  <div className="text-gray-400">H:</div>
                  <div className="text-gray-400">L:</div>
                  <div className="text-gray-400">C:</div>
                </div>
                <div>
                  <div>₹{hoveredCandle.open.toFixed(2)}</div>
                  <div className="text-green-400">₹{hoveredCandle.high.toFixed(2)}</div>
                  <div className="text-red-400">₹{hoveredCandle.low.toFixed(2)}</div>
                  <div className={hoveredCandle.close >= hoveredCandle.open ? 'text-green-400' : 'text-red-400'}>
                    ₹{hoveredCandle.close.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-gray-400 mt-1">
                Vol: {(hoveredCandle.volume / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        )}

        {/* Current Price Line */}
        {data.length > 0 && (
          <div 
            className="absolute left-0 right-0 h-px bg-yellow-400 opacity-60"
            style={{
              top: `${getY(data[data.length - 1].close) / chartHeight * 100}%`
            }}
          >
            <div className="absolute right-2 -top-2 bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded font-mono font-bold">
              ₹{data[data.length - 1].close.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Chart Controls */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
        <div className="flex space-x-2">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
            <button
              key={period}
              className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
            >
              {period}
            </button>
          ))}
        </div>
        <div className="text-gray-400 text-xs">
          {data.length} candles • OHLC
        </div>
      </div>
    </div>
  );
};

export default CandleStickChart;