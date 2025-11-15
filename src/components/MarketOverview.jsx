// components/MarketOverview.jsx
import { useState, useEffect } from 'react';
import { fetchTopStocks } from '../services/stockApi';
import { TrendingUpIcon, TrendingDownIcon, BullishIcon, BearishIcon } from './Icons';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    const loadMarketData = async () => {
      const stocks = await fetchTopStocks();
      const gainers = stocks.filter(s => parseFloat(s.change) >= 0).length;
      const losers = stocks.filter(s => parseFloat(s.change) < 0).length;
      const totalChange = stocks.reduce((sum, stock) => sum + parseFloat(stock.changePercent), 0);
      const avgChange = totalChange / stocks.length;

      setMarketData({
        totalStocks: stocks.length,
        gainers,
        losers,
        avgChange,
        sentiment: avgChange >= 0 ? 'bullish' : 'bearish'
      });
    };

    loadMarketData();
    const interval = setInterval(loadMarketData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!marketData) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Stocks */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Stocks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{marketData.totalStocks}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUpIcon />
          </div>
        </div>
      </div>

      {/* Gainers */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Gainers</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{marketData.gainers}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <TrendingUpIcon />
          </div>
        </div>
      </div>

      {/* Losers */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Losers</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{marketData.losers}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <TrendingDownIcon />
          </div>
        </div>
      </div>

      {/* Market Sentiment */}
      <div className={`rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-shadow ${
        marketData.sentiment === 'bullish' 
          ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-linear-to-r from-red-50 to-rose-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Market Sentiment</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{marketData.sentiment}</p>
            <p className="text-sm text-gray-500 mt-1">
              {marketData.avgChange.toFixed(2)}% avg
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            marketData.sentiment === 'bullish' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {marketData.sentiment === 'bullish' ? <BullishIcon /> : <BearishIcon />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;