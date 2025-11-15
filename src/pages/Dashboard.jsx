// pages/Dashboard.jsx - Updated to prevent reloads after market close
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LivePriceTicker from '../components/LivePriceTicker';
import MarketOverview from '../components/MarketOverview';
import StockCard from '../components/StockCard';
import CandleChart from '../components/CandleChart';
import { fetchTopStocks, fetchStockHistory, hasClosingPrices } from '../services/stockApi';
import { isMarketOpen, isMarketClosedForDay } from '../utils/marketHours';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  ChartIcon,
  GainersIcon,
  LosersIcon 
} from '../components/Icons';

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // If market is closed and we have closing prices, use them without API call
        if (isMarketClosedForDay() && hasClosingPrices()) {
          console.log('📊 Using stored closing prices for dashboard');
          const stocksData = await fetchTopStocks(8, false); // Don't force real-time updates
          const chartData = await fetchStockHistory(selectedStock);
          setStocks(stocksData);
          setChartData(chartData);
          setIsStatic(true);
        } else {
          const [stocksData, chartData] = await Promise.all([
            fetchTopStocks(8, true),
            fetchStockHistory(selectedStock)
          ]);
          setStocks(stocksData);
          setChartData(chartData);
          setIsStatic(!isMarketOpen());
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Only set interval for updates during market hours
    let interval;
    if (isMarketOpen()) {
      interval = setInterval(loadData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedStock]);

  // ... rest of the component remains the same, but add static indicator
  const topGainers = stocks.filter(s => parseFloat(s.change) >= 0)
    .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
    .slice(0, 4);

  const topLosers = stocks.filter(s => parseFloat(s.change) < 0)
    .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
    .slice(0, 4);

  if (loading) {
    return (
      <div>
        <LivePriceTicker />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading market data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LivePriceTicker />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with static indicator */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-3">
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Market Dashboard
            </h1>
            {isStatic && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                Closing Prices
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {isStatic 
              ? 'End of day market snapshot - Prices from market close'
              : 'Real-time NSE stock prices, advanced charts, and comprehensive market analysis'
            }
          </p>
          <div className="flex items-center justify-center space-x-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${
              isStatic ? 'bg-blue-500' : 'bg-green-500 animate-pulse'
            }`}></div>
            <span className={`text-sm font-medium ${
              isStatic ? 'text-blue-600' : 'text-green-600'
            }`}>
              {isStatic ? 'Market Closed' : 'Live Data Streaming'}
            </span>
          </div>
        </div>

        <MarketOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Chart Section - 2/3 width */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ChartIcon />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Live Price Chart</h2>
                    <p className="text-sm text-gray-500">Real-time candlestick analysis</p>
                  </div>
                </div>
                <select 
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {stocks.map(stock => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </option>
                  ))}
                </select>
              </div>
              {chartData.length > 0 && (
                <CandleChart 
                  data={chartData} 
                  height={400}
                />
              )}
            </div>
          </div>

          {/* Top Performers - 1/3 width */}
          <div className="space-y-6">
            {/* Top Gainers */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <GainersIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Gainers</h3>
                    <p className="text-sm text-gray-500">Today's best performers</p>
                  </div>
                </div>
                <span className="text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded">Live</span>
              </div>
              <div className="space-y-3">
                {topGainers.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {stock.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{stock.symbol}</h4>
                        <p className="text-xs text-gray-500">₹{stock.price}</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-bold text-sm bg-white px-2 py-1 rounded">
                      +{parseFloat(stock.change).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <LosersIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Losers</h3>
                    <p className="text-sm text-gray-500">Today's underperformers</p>
                  </div>
                </div>
                <span className="text-red-500 text-sm font-semibold bg-red-50 px-2 py-1 rounded">Live</span>
              </div>
              <div className="space-y-3">
                {topLosers.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {stock.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{stock.symbol}</h4>
                        <p className="text-xs text-gray-500">₹{stock.price}</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-bold text-sm bg-white px-2 py-1 rounded">
                      {parseFloat(stock.change).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Stocks */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Stocks</h2>
              <p className="text-gray-600 mt-1">Popular NSE stocks with real-time updates</p>
            </div>
            <Link 
              to="/stocks" 
              className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold inline-flex items-center space-x-2"
            >
              <span>View All Stocks</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stocks.slice(0, 8).map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;