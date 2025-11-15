// components/LivePriceTicker.jsx - Updated with holiday support
import { useState, useEffect, useRef } from 'react';
import { fetchTopStocks, hasClosingPrices } from '../services/stockApi';
import { LiveIcon } from './Icons';
import { 
  isMarketOpen, 
  isMarketClosedForDay, 
  getMarketStatusMessage,
  getMarketStatus 
} from '../utils/marketHours';

const LivePriceTicker = () => {
  const [stocks, setStocks] = useState([]);
  const [priceAnimations, setPriceAnimations] = useState({});
  const [marketStatus, setMarketStatus] = useState(null);
  const [isStatic, setIsStatic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousPrices = useRef({});

  useEffect(() => {
    const updateMarketStatus = () => {
      const status = getMarketStatus();
      setMarketStatus(status);
      setIsStatic(status !== 'open');
    };

    const loadStocks = async () => {
      setIsLoading(true);
      
      // If market is closed for any reason and we have closing prices, don't reload
      if (isMarketClosedForDay() && hasClosingPrices()) {
        console.log('📊 Using stored closing prices - no reload needed');
        const data = await fetchTopStocks(8, false);
        setStocks(data);
        updateMarketStatus();
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchTopStocks(8, true);
        setStocks(data);
        
        data.forEach(stock => {
          previousPrices.current[stock.symbol] = parseFloat(stock.price);
        });
        
        updateMarketStatus();
      } catch (error) {
        console.error('Error loading ticker data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadStocks();
    updateMarketStatus();

    // Real-time price updates only during market hours and if not static
    const priceUpdateInterval = setInterval(() => {
      if (isStatic || !isMarketOpen() || isLoading || marketStatus !== 'open') {
        return;
      }
      
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const currentPrice = parseFloat(stock.price);
          const previousPrice = previousPrices.current[stock.symbol] || currentPrice;
          
          const volatility = 0.0015;
          const randomMove = (Math.random() - 0.5) * 2 * volatility * currentPrice;
          const currentTrend = parseFloat(stock.change) >= 0 ? 1 : -1;
          const momentum = Math.random() < 0.6 ? currentTrend * volatility * currentPrice * 0.2 : 0;
          
          const totalChange = randomMove + momentum;
          const newPrice = Math.max(currentPrice + totalChange, currentPrice * 0.8);
          
          if (newPrice > currentPrice) {
            setPriceAnimations(prev => ({ ...prev, [stock.symbol]: 'up' }));
            setTimeout(() => setPriceAnimations(prev => ({ ...prev, [stock.symbol]: null })), 500);
          } else if (newPrice < currentPrice) {
            setPriceAnimations(prev => ({ ...prev, [stock.symbol]: 'down' }));
            setTimeout(() => setPriceAnimations(prev => ({ ...prev, [stock.symbol]: null })), 500);
          }
          
          previousPrices.current[stock.symbol] = newPrice;
          
          const newChange = parseFloat(stock.change) + totalChange;
          const newChangePercent = (newChange / parseFloat(stock.previousClose)) * 100;
          
          return {
            ...stock,
            price: newPrice.toFixed(2),
            change: newChange.toFixed(2),
            changePercent: newChangePercent.toFixed(2),
            high: parseFloat(stock.high) > newPrice ? stock.high : newPrice.toFixed(2),
            low: parseFloat(stock.low) < newPrice ? stock.low : newPrice.toFixed(2),
            volume: stock.volume + Math.floor(Math.random() * 500),
            lastUpdated: new Date().toISOString(),
            marketStatus: 'open'
          };
        })
      );
    }, 1000);

    // Check market status every 30 seconds
    const marketStatusInterval = setInterval(() => {
      updateMarketStatus();
    }, 30000);

    // Only refresh data during market hours
    const dataRefreshInterval = setInterval(() => {
      if (isMarketOpen() && !isStatic && !isLoading) {
        loadStocks();
      }
    }, isMarketOpen() ? 60000 : 300000);

    return () => {
      clearInterval(priceUpdateInterval);
      clearInterval(marketStatusInterval);
      clearInterval(dataRefreshInterval);
    };
  }, [isStatic, isLoading, marketStatus]);

  const getStatusColor = () => {
    if (!marketStatus) return 'from-gray-600 to-gray-700';
    
    switch (marketStatus) {
      case 'open':
        return isStatic ? 'from-blue-600 to-indigo-700' : 'from-green-600 to-emerald-700';
      case 'pre_open':
        return 'from-blue-500 to-blue-700';
      case 'weekend':
      case 'holiday':
      case 'closed':
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const statusInfo = getMarketStatusMessage();

  if (isLoading) {
    return (
      <div className={`bg-linear-to-r ${getStatusColor()} py-3 overflow-hidden`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span className="text-white text-sm">Loading market data...</span>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className={`bg-linear-to-r ${getStatusColor()} py-3 overflow-hidden`}>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-white text-sm font-bold">{statusInfo.message}</span>
          </div>
          <div className="text-xs text-white opacity-80">
            No market data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-linear-to-r ${getStatusColor()} py-3 overflow-hidden relative border-b border-white border-opacity-20 transition-all duration-500`}>
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            marketStatus === 'open' && !isStatic 
              ? 'bg-green-400 animate-pulse' 
              : 'bg-gray-400'
          }`}></div>
          {marketStatus === 'open' && !isStatic && <LiveIcon />}
          <span className="ml-1 text-white text-sm font-bold">{statusInfo.message}</span>
        </div>
        <div className="text-xs text-white opacity-80 text-right max-w-[200px]">
          {statusInfo.description}
        </div>
      </div>

      {/* Ticker Container */}
      <div className="relative">
        <div className={`flex whitespace-nowrap ${marketStatus === 'open' && !isStatic ? 'animate-marquee' : ''}`}>
          {[...stocks, ...stocks].map((stock, index) => {
            const isPositive = parseFloat(stock.change) >= 0;
            const animation = priceAnimations[stock.symbol];
            const isLive = marketStatus === 'open' && !isStatic;
            
            return (
              <div 
                key={`${stock.symbol}-${index}`} 
                className={`flex items-center space-x-4 mx-6 transition-all duration-200 px-3 py-1 rounded-lg ${
                  isLive ? 'hover:bg-white hover:bg-opacity-10' : 'opacity-90'
                }`}
              >
                <span className={`font-bold text-sm text-white px-3 py-1 rounded border ${
                  isLive 
                    ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
                    : 'bg-gray-500 bg-opacity-20 border-gray-400 border-opacity-20'
                }`}>
                  {stock.symbol}
                </span>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-bold transition-all duration-200 ${
                    isLive && animation === 'up' 
                      ? 'text-green-300 scale-110' 
                      : isLive && animation === 'down' 
                      ? 'text-red-300 scale-110' 
                      : 'text-white'
                  } ${!isLive ? 'opacity-90' : ''}`}>
                    ₹{stock.price}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded font-bold transition-all duration-200 ${
                    isLive
                      ? isPositive 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-gray-500 text-white opacity-90'
                  } ${isLive && animation ? 'scale-105' : ''}`}>
                    <span className="flex items-center space-x-1">
                      {isLive && <span>{isPositive ? '↗' : '↘'}</span>}
                      <span>{isPositive ? '+' : ''}{stock.change}%</span>
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
          display: inline-flex;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LivePriceTicker;