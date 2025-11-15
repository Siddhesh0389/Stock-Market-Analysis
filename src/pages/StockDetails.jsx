// pages/StockDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LivePriceTicker from '../components/LivePriceTicker';
import CandleStickChart from '../components/CandleStickChart';
import { fetchStockDetails, fetchStockHistory } from '../services/stockApi';

const StockDetails = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1d');

  useEffect(() => {
    const loadStockData = async () => {
      setLoading(true);
      try {
        const [details, history] = await Promise.all([
          fetchStockDetails(symbol),
          fetchStockHistory(symbol, period)
        ]);
        console.log('Stock details:', details);
        console.log('Chart data:', history);
        setStock(details);
        setChartData(history);
      } catch (error) {
        console.error('Error loading stock details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, [symbol, period]);

  if (loading) {
    return (
      <div>
        <LivePriceTicker />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live data for {symbol}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div>
        <LivePriceTicker />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">Stock not found</h3>
          <Link to="/stocks" className="text-blue-600 hover:text-blue-500 text-sm">
            Back to stocks list
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = parseFloat(stock.change) >= 0;
  const fromLow = stock.yearLow && stock.yearLow !== '0.00' ? 
    ((parseFloat(stock.price) / parseFloat(stock.yearLow) - 1) * 100).toFixed(1) : '0.0';
  const fromHigh = stock.yearHigh && stock.yearHigh !== '0.00' ? 
    ((parseFloat(stock.price) / parseFloat(stock.yearHigh) - 1) * 100).toFixed(1) : '0.0';

  return (
    <div>
      <LivePriceTicker />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/stocks" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all stocks
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
              <p className="text-lg text-gray-600 mt-1">{stock.name}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-gray-500">Live • NSE • {stock.sector}</span>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-4xl font-bold text-gray-900">₹{stock.price}</div>
              <div className={`text-xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{stock.change} ({isPositive ? '+' : ''}{stock.changePercent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Trading View - Candlestick Chart</h2>
            <div className="flex space-x-2 mt-2 lg:mt-0">
              {['1d', '1w', '1m', '3m', '1y'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {chartData && chartData.length > 0 ? (
            <CandleStickChart 
              data={chartData} 
              height={500}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No chart data available
            </div>
          )}
        </div>

        {/* Stock Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Open</p>
                  <p className="text-lg font-semibold text-gray-900">₹{stock.open || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">High</p>
                  <p className="text-lg font-semibold text-green-600">₹{stock.high || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Low</p>
                  <p className="text-lg font-semibold text-red-600">₹{stock.low || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Previous Close</p>
                  <p className="text-lg font-semibold text-gray-900">₹{stock.previousClose || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Volume</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.volume ? `${(stock.volume / 1000000).toFixed(1)}M` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Market Cap</p>
                  <p className="text-lg font-semibold text-gray-900">{stock.marketCap || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">P/E Ratio</p>
                  <p className="text-lg font-semibold text-gray-900">{stock.peRatio || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Beta</p>
                  <p className="text-lg font-semibold text-gray-900">{stock.beta || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Company Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Sector</p>
                <p className="text-lg font-semibold text-gray-900">{stock.sector || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dividend Yield</p>
                <p className="text-lg font-semibold text-gray-900">{stock.dividendYield || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">52W High</p>
                <p className="text-lg font-semibold text-green-600">₹{stock.yearHigh || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">52W Low</p>
                <p className="text-lg font-semibold text-red-600">₹{stock.yearLow || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Volume</p>
                <p className="text-lg font-semibold text-gray-900">{stock.avgVolume || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{isPositive ? '📈' : '📉'}</div>
              <div className="text-lg font-semibold mt-2">
                {isPositive ? 'Bullish' : 'Bearish'}
              </div>
              <div className="text-blue-100 text-sm">Trend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stock.changePercent || '0.00'}%</div>
              <div className="text-lg font-semibold mt-2">Today</div>
              <div className="text-blue-100 text-sm">Change</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {fromHigh}%
              </div>
              <div className="text-lg font-semibold mt-2">From High</div>
              <div className="text-blue-100 text-sm">Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {fromLow}%
              </div>
              <div className="text-lg font-semibold mt-2">From Low</div>
              <div className="text-blue-100 text-sm">Performance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;