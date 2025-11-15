// components/StockCard.jsx
import { Link } from 'react-router-dom';
import { TrendingUpIcon, TrendingDownIcon } from './Icons';

const StockCard = ({ stock }) => {
  const isPositive = parseFloat(stock.change) >= 0;

  return (
    <Link to={`/stock/${stock.symbol}`}>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group">
        <div className="p-5">
          {/* Header with Symbol and Live Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200 ${
                isPositive 
                  ? 'bg-linear-to-br from-green-500 to-green-600' 
                  : 'bg-linear-to-br from-red-500 to-red-600'
              }`}>
                <span className="text-white font-bold text-sm">
                  {stock.symbol.substring(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {stock.symbol}
                </h3>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</p>
              </div>
            </div>
            <div className={`p-1 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              {isPositive ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
            </div>
          </div>
          
          {/* Price and Change */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">
                ₹{stock.price}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                isPositive 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {isPositive ? '+' : ''}{stock.change}%
              </span>
            </div>
            
            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500 font-medium">Open</p>
                <p className="font-semibold text-gray-700">₹{stock.open}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Volume</p>
                <p className="font-semibold text-gray-700">
                  {stock.volume ? `${(stock.volume / 1000000).toFixed(1)}M` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with Market Status */}
        <div className={`px-4 py-2 text-center text-xs font-semibold border-t ${
          isPositive 
            ? 'bg-green-50 text-green-700 border-green-100' 
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span>Live • {isPositive ? 'Gaining' : 'Declining'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StockCard;