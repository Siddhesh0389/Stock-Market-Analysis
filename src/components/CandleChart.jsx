// components/CandleChart.jsx
import { useState, useEffect } from 'react';

const CandleChart = ({ data, color = '#3B82F6', height = 300 }) => {
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

  const chartHeight = 300;
  const padding = 40;
  const candleWidth = 8;
  const availableHeight = chartHeight - padding * 2;

  const getY = (price) => {
    const percentage = ((price - minPrice) / priceRange) * 100;
    return (100 - percentage) * availableHeight / 100 + padding;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`h-${height} bg-white p-6 rounded-lg border border-gray-200 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Candlestick Chart</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
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

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="smallGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />

          {/* Price level lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const price = minPrice + (priceRange * ratio);
            const y = getY(price);
            return (
              <g key={`price-level-${i}`}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x="5"
                  y={y - 5}
                  fill="#6b7280"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ₹{price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Candlesticks */}
          {data.map((candle, index) => {
            const x = (index / (data.length - 1)) * 95 + 2.5; // 95% width with 2.5% margin on each side
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            
            const isBullish = candle.close >= candle.open;
            const candleColor = isBullish ? '#10B981' : '#EF4444';
            const candleHeight = Math.abs(closeY - openY) || 1;
            const candleY = Math.min(openY, closeY);

            const barWidth = Math.max(2, (95 / data.length) - 1);

            return (
              <g 
                key={index}
                onMouseEnter={() => setHoveredCandle({ ...candle, index, x, y: candleY })}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-pointer transition-all duration-200"
                style={{ transform: `translateX(${x}%)` }}
              >
                {/* High-Low line (Wick) */}
                <line
                  x1={barWidth / 2}
                  y1={highY}
                  x2={barWidth / 2}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth="1.5"
                />
                
                {/* Candle body */}
                <rect
                  x="0"
                  y={candleY}
                  width={barWidth}
                  height={candleHeight}
                  fill={candleColor}
                  stroke={candleColor}
                  strokeWidth="1"
                  rx="1"
                />

                {/* Hover effect */}
                {hoveredCandle?.index === index && (
                  <rect
                    x={-barWidth}
                    y={highY - 10}
                    width={barWidth * 3}
                    height={lowY - highY + 20}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    rx="4"
                  />
                )}
              </g>
            );
          })}

          {/* Current price line */}
          {data.length > 0 && (
            <line
              x1="0"
              y1={getY(data[data.length - 1].close)}
              x2="100%"
              y2={getY(data[data.length - 1].close)}
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          )}
        </svg>

        {/* Tooltip */}
        {hoveredCandle && (
          <div 
            className="absolute bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs z-10 border border-gray-700"
            style={{
              left: `${hoveredCandle.x}%`,
              top: `${hoveredCandle.y - 80}px`,
              transform: 'translateX(-50%)',
              minWidth: '140px'
            }}
          >
            <div className="font-mono space-y-1">
              <div className="text-gray-300 text-xs">
                {formatTime(hoveredCandle.time)}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-gray-400">Open:</div>
                <div>₹{hoveredCandle.open.toFixed(2)}</div>
                <div className="text-gray-400">High:</div>
                <div className="text-green-400">₹{hoveredCandle.high.toFixed(2)}</div>
                <div className="text-gray-400">Low:</div>
                <div className="text-red-400">₹{hoveredCandle.low.toFixed(2)}</div>
                <div className="text-gray-400">Close:</div>
                <div className={hoveredCandle.close >= hoveredCandle.open ? 'text-green-400' : 'text-red-400'}>
                  ₹{hoveredCandle.close.toFixed(2)}
                </div>
              </div>
              {hoveredCandle.volume && (
                <div className="text-gray-400 mt-1 text-xs">
                  Vol: {(hoveredCandle.volume / 1000).toFixed(0)}K
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}

        {/* Current price indicator */}
        {data.length > 0 && (
          <div 
            className="absolute right-2 bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded font-mono font-bold shadow-sm"
            style={{
              top: `${getY(data[data.length - 1].close) - 12}px`
            }}
          >
            ₹{data[data.length - 1].close.toFixed(2)}
          </div>
        )}
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-3 px-2">
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((candle, i) => (
          <span key={i}>{formatTime(candle.time)}</span>
        ))}
      </div>

      {/* Chart info */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {data.length} periods • OHLC Chart
        </div>
        <div className="flex space-x-1">
          {['1H', '4H', '1D', '1W'].map((period) => (
            <button
              key={period}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandleChart;