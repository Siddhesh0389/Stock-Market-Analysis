// components/Footer.jsx - Updated for better consistency
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">₹</span>
              </div>
              <span className="text-xl font-bold text-white">StockLive</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real-time NSE stock market analysis and tracking platform with professional tools for investors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/stocks" className="text-gray-400 hover:text-white transition-colors duration-200">
                  All Stocks
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Market News
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Portfolio
                </a>
              </li>
            </ul>
          </div>

          {/* Market Data */}
          <div>
            <h3 className="font-semibold text-white mb-4">Market Data</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Live Prices
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Technical Analysis
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Real-time Charts
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Market Trends
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="font-semibold text-white mb-4">Information</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Stock market investments are subject to market risks. 
              All data shown is for informational purposes only.
              Past performance is not indicative of future results.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2025 StockLive. All rights reserved. | NSE Real-time Data
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;