// pages/StocksList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LivePriceTicker from '../components/LivePriceTicker';
import StockCard from '../components/StockCard';
import { fetchAllStocks, searchStocks, hasClosingPrices } from '../services/stockApi';
import { isMarketOpen, isMarketClosedForDay } from '../utils/marketHours';

const StocksList = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      try {
        let stocksData;
        
        // If market is closed and we have closing prices, use them without API call
        if (isMarketClosedForDay() && hasClosingPrices()) {
          console.log('📊 Using stored closing prices for stocks list');
          stocksData = await fetchAllStocks();
          setIsStatic(true);
        } else {
          stocksData = await fetchAllStocks();
          setIsStatic(!isMarketOpen());
        }
        
        setStocks(stocksData);
        setFilteredStocks(stocksData);
        console.log('Loaded ALL stocks:', stocksData.length);
        
      } catch (error) {
        console.error('Error loading stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStocks();

    // Only set interval for updates during market hours
    let interval;
    if (isMarketOpen()) {
      interval = setInterval(loadStocks, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredStocks(stocks);
        return;
      }

      try {
        const results = await searchStocks(searchQuery);
        setFilteredStocks(results);
      } catch (error) {
        console.error('Error searching stocks:', error);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, stocks]);

  useEffect(() => {
    let sortedStocks = [...filteredStocks];
    
    switch (sortBy) {
      case 'gainers':
        sortedStocks.sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
        break;
      case 'losers':
        sortedStocks.sort((a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent));
        break;
      case 'highPrice':
        sortedStocks.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'lowPrice':
        sortedStocks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'volume':
        sortedStocks.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
        break;
      default:
        sortedStocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    
    setFilteredStocks(sortedStocks);
  }, [sortBy, stocks]);

  if (loading) {
    return (
      <div>
        <LivePriceTicker />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading all stock data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LivePriceTicker />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with static indicator */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              All NSE Stocks
            </h1>
            {isStatic && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                Closing Prices
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg">
            {isStatic 
              ? `End of day snapshot - ${stocks.length} stocks with closing prices`
              : `Browse and analyze ${stocks.length} NSE stocks with real-time data`
            }
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              isStatic ? 'bg-blue-500' : 'bg-green-500 animate-pulse'
            }`}></div>
            <span className={`text-sm font-medium ${
              isStatic ? 'text-blue-600' : 'text-green-600'
            }`}>
              {isStatic ? 'Market Closed - Showing Closing Prices' : 'Live Market Data'}
            </span>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Stocks
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Search by symbol or company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="default">Default (A-Z)</option>
                <option value="gainers">Top Gainers</option>
                <option value="losers">Top Losers</option>
                <option value="highPrice">Highest Price</option>
                <option value="lowPrice">Lowest Price</option>
                <option value="volume">Trading Volume</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredStocks.length} of {stocks.length} stocks
              {isStatic && ' (Closing Prices)'}
            </p>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Stocks Grid */}
        {filteredStocks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {stocks.length === 0 ? 'No Stocks Available' : 'No Stocks Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {stocks.length === 0 
                ? 'Unable to load stock data. Please check your API connection.'
                : 'Try adjusting your search query or filter criteria.'
              }
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {stocks.length === 0 ? 'Retry' : 'Clear Search'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}

        {/* Market Summary */}
        <div className="mt-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isStatic ? 'End of Day Summary' : 'Market Summary'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {stocks.filter(s => parseFloat(s.change) >= 0).length}
                </div>
                <div className="text-blue-100">Gaining Stocks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {stocks.filter(s => parseFloat(s.change) < 0).length}
                </div>
                <div className="text-blue-100">Declining Stocks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stocks.length}</div>
                <div className="text-blue-100">Total Stocks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {stocks.length > 0 
                    ? ((stocks.filter(s => parseFloat(s.change) >= 0).length / stocks.length) * 100).toFixed(1)
                    : '0'
                  }%
                </div>
                <div className="text-blue-100">Market Positive</div>
              </div>
            </div>
            {isStatic && (
              <div className="mt-4 pt-4 border-t border-blue-400 border-opacity-30">
                <p className="text-blue-100 text-sm">
                  Final prices from today's market close at 3:30 PM
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StocksList;