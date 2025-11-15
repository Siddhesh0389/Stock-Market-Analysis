// services/stockApi.js - Fixed to return ALL stocks
import axios from 'axios';
import { isMarketOpen, getMarketStatus, isMarketClosedForDay } from '../utils/marketHours';

// Yahoo Finance API configuration
const YAHOO_FINANCE_BASE_URL = 'https://yfapi.net';
const YAHOO_API_KEY = 'awYBybEFtkapU9rYCpv5B9oEnWPIoQeM2YrEy0dc';

const NSE_SYMBOLS = [
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
  'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'HINDUNILVR.NS', 'ITC.NS',
  'LT.NS', 'HCLTECH.NS', 'AXISBANK.NS', 'MARUTI.NS', 'ASIANPAINT.NS',
  'SUNPHARMA.NS', 'TITAN.NS', 'ULTRACEMCO.NS', 'NESTLEIND.NS', 'WIPRO.NS'
];

// Helper functions (keep the same)
const formatMarketCap = (marketCap) => {
  if (!marketCap || marketCap === 0) return 'N/A';
  if (marketCap >= 1e12) return `₹${(marketCap / 1e12).toFixed(1)}T`;
  if (marketCap >= 1e9) return `₹${(marketCap / 1e9).toFixed(1)}B`;
  if (marketCap >= 1e6) return `₹${(marketCap / 1e6).toFixed(1)}M`;
  return `₹${marketCap}`;
};

const getSector = (symbol) => {
  const sectors = {
    'RELIANCE': 'Energy & Petrochemicals',
    'TCS': 'Information Technology',
    'INFY': 'Information Technology',
    'HDFCBANK': 'Banking & Financial Services',
    'ICICIBANK': 'Banking & Financial Services',
    'SBIN': 'Banking & Financial Services',
    'BHARTIARTL': 'Telecommunications',
    'KOTAKBANK': 'Banking & Financial Services',
    'HINDUNILVR': 'FMCG',
    'ITC': 'FMCG & Diversified',
    'LT': 'Engineering & Construction',
    'HCLTECH': 'Information Technology',
    'AXISBANK': 'Banking & Financial Services',
    'MARUTI': 'Automobile',
    'ASIANPAINT': 'Paints & Chemicals',
    'SUNPHARMA': 'Pharmaceuticals',
    'TITAN': 'Consumer Goods - Luxury',
    'ULTRACEMCO': 'Cement & Construction',
    'NESTLEIND': 'FMCG',
    'WIPRO': 'Information Technology'
  };
  return sectors[symbol] || 'Diversified';
};

// Store last known real prices when market closes
let marketClosePrices = null;

// Fallback data with realistic prices
const getFallbackStockData = (symbol) => {
  const fallbackPrices = {
    'RELIANCE.NS': { price: 2456.75, change: 12.50, name: 'Reliance Industries Limited' },
    'TCS.NS': { price: 3112.00, change: -8.45, name: 'Tata Consultancy Services Limited' },
    'INFY.NS': { price: 1505.80, change: 5.25, name: 'Infosys Limited' },
    'HDFCBANK.NS': { price: 1425.30, change: -3.20, name: 'HDFC Bank Limited' },
    'ICICIBANK.NS': { price: 890.45, change: 2.15, name: 'ICICI Bank Limited' },
    'SBIN.NS': { price: 550.80, change: 1.25, name: 'State Bank of India' },
    'BHARTIARTL.NS': { price: 780.25, change: -2.75, name: 'Bharti Airtel Limited' },
    'KOTAKBANK.NS': { price: 1650.40, change: 8.60, name: 'Kotak Mahindra Bank Limited' },
    'HINDUNILVR.NS': { price: 2450.60, change: -5.80, name: 'Hindustan Unilever Limited' },
    'ITC.NS': { price: 420.35, change: 1.45, name: 'ITC Limited' },
    'LT.NS': { price: 3250.80, change: 15.20, name: 'Larsen & Toubro Limited' },
    'HCLTECH.NS': { price: 1250.45, change: -3.75, name: 'HCL Technologies Limited' },
    'AXISBANK.NS': { price: 950.20, change: 2.80, name: 'Axis Bank Limited' },
    'MARUTI.NS': { price: 9800.75, change: -25.50, name: 'Maruti Suzuki India Limited' },
    'ASIANPAINT.NS': { price: 2850.90, change: 12.80, name: 'Asian Paints Limited' },
    'SUNPHARMA.NS': { price: 1250.25, change: -4.35, name: 'Sun Pharmaceutical Industries' },
    'TITAN.NS': { price: 3250.40, change: 18.60, name: 'Titan Company Limited' },
    'ULTRACEMCO.NS': { price: 8500.60, change: -15.75, name: 'UltraTech Cement Limited' },
    'NESTLEIND.NS': { price: 23500.45, change: 125.80, name: 'Nestle India Limited' },
    'WIPRO.NS': { price: 420.80, change: -1.25, name: 'Wipro Limited' }
  };

  const fallbackData = fallbackPrices[symbol] || { 
    price: 1000.00, 
    change: 0.00, 
    name: symbol.replace('.NS', '') + ' Limited' 
  };

  const basePrice = fallbackData.price;
  const change = fallbackData.change;
  const changePercent = (change / (basePrice - change)) * 100;

  return {
    symbol: symbol.replace('.NS', ''),
    name: fallbackData.name,
    price: basePrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    open: (basePrice - (Math.random() * 10)).toFixed(2),
    high: (basePrice + (Math.random() * 15)).toFixed(2),
    low: (basePrice - (Math.random() * 12)).toFixed(2),
    volume: Math.floor(Math.random() * 5000000) + 1000000,
    previousClose: (basePrice - change).toFixed(2),
    marketCap: formatMarketCap(basePrice * (Math.random() * 100000000 + 50000000)),
    peRatio: (Math.random() * 40 + 15).toFixed(2),
    sector: getSector(symbol.replace('.NS', '')),
    dividendYield: (Math.random() * 2.5).toFixed(2) + '%',
    yearHigh: (basePrice * 1.15).toFixed(2),
    yearLow: (basePrice * 0.85).toFixed(2),
    avgVolume: Math.floor(Math.random() * 3000000 + 500000).toLocaleString(),
    beta: (Math.random() * 1.2 + 0.8).toFixed(2),
    lastUpdated: new Date().toISOString(),
    isRealData: false,
    isFallback: true
  };
};

// Enhanced API function that ALWAYS returns all stocks
export const fetchTopStocks = async (limit = null) => {
  try {
    const marketStatus = getMarketStatus();
    
    // If market is closed and we have stored real close prices, return them
    if (isMarketClosedForDay() && marketClosePrices) {
      console.log('📊 Market closed - returning stored closing prices');
      let stocks = Object.values(marketClosePrices);
      if (limit) {
        console.log(`🔸 Applying limit: ${limit} stocks`);
        stocks = stocks.slice(0, limit);
      }
      console.log(`📊 Returning ${stocks.length} stocks (stored closing prices)`);
      return stocks.map(stock => ({
        ...stock,
        marketStatus: 'closed',
        isClosingPrice: true
      }));
    }

    console.log(`📈 Fetching ${limit ? limit + ' limited' : 'ALL'} stocks from Yahoo Finance...`);
    
    const stocks = [];
    const symbolsToFetch = limit ? NSE_SYMBOLS.slice(0, limit) : NSE_SYMBOLS;
    
    console.log(`🔸 Symbols to fetch: ${symbolsToFetch.length}`, symbolsToFetch);

    // Try Yahoo Finance API first
    let apiSuccess = false;
    try {
      const batchSize = 5; // Increased batch size
      for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
        const batch = symbolsToFetch.slice(i, i + batchSize);
        const symbolsParam = batch.join(',');
        
        console.log(`🔄 Fetching batch: ${symbolsParam}`);

        const response = await axios.get(`${YAHOO_FINANCE_BASE_URL}/v6/finance/quote`, {
          headers: {
            'X-API-KEY': YAHOO_API_KEY,
            'Content-Type': 'application/json'
          },
          params: {
            symbols: symbolsParam
          },
          timeout: 10000
        });

        const data = response.data;
        
        if (data?.quoteResponse?.result) {
          apiSuccess = true;
          data.quoteResponse.result.forEach(stockData => {
            if (stockData?.regularMarketPrice !== undefined) {
              const stockInfo = {
                symbol: stockData.symbol.replace('.NS', ''),
                name: stockData.longName || stockData.shortName || stockData.symbol.replace('.NS', ''),
                price: stockData.regularMarketPrice?.toFixed(2) || '0.00',
                change: stockData.regularMarketChange?.toFixed(2) || '0.00',
                changePercent: stockData.regularMarketChangePercent?.toFixed(2) || '0.00',
                open: stockData.regularMarketOpen?.toFixed(2) || '0.00',
                high: stockData.regularMarketDayHigh?.toFixed(2) || '0.00',
                low: stockData.regularMarketDayLow?.toFixed(2) || '0.00',
                volume: stockData.regularMarketVolume || 0,
                previousClose: stockData.regularMarketPreviousClose?.toFixed(2) || '0.00',
                marketCap: formatMarketCap(stockData.marketCap),
                peRatio: stockData.trailingPE?.toFixed(2) || 'N/A',
                sector: getSector(stockData.symbol.replace('.NS', '')),
                dividendYield: stockData.dividendYield ? (stockData.dividendYield * 100).toFixed(2) + '%' : 'N/A',
                yearHigh: stockData.fiftyTwoWeekHigh?.toFixed(2) || 'N/A',
                yearLow: stockData.fiftyTwoWeekLow?.toFixed(2) || 'N/A',
                avgVolume: stockData.averageVolume?.toLocaleString() || 'N/A',
                beta: stockData.beta?.toFixed(2) || 'N/A',
                lastUpdated: new Date().toISOString(),
                marketStatus: marketStatus,
                isRealData: true
              };

              stocks.push(stockInfo);
              console.log(`✅ Real data for ${stockInfo.symbol}: ₹${stockInfo.price}`);
            }
          });
        } else {
          console.log('❌ No result in API response');
        }

        // Rate limiting delay
        if (i + batchSize < symbolsToFetch.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (apiError) {
      console.error('❌ Yahoo Finance API failed:', apiError.message);
      apiSuccess = false;
    }

    // If API failed or returned incomplete data, use fallback for missing stocks
    if (!apiSuccess || stocks.length < symbolsToFetch.length) {
      console.log(`🔄 API returned ${stocks.length}/${symbolsToFetch.length} stocks, using fallback for missing ones`);
      
      const fetchedSymbols = new Set(stocks.map(s => s.symbol));
      const missingSymbols = symbolsToFetch.filter(symbol => 
        !fetchedSymbols.has(symbol.replace('.NS', ''))
      );

      console.log(`🔸 Missing symbols: ${missingSymbols.length}`, missingSymbols);

      missingSymbols.forEach(symbol => {
        const fallbackStock = getFallbackStockData(symbol);
        stocks.push(fallbackStock);
        console.log(`🔄 Fallback data for ${fallbackStock.symbol}: ₹${fallbackStock.price}`);
      });
    }

    // Ensure we have exactly the number of stocks we requested
    if (stocks.length !== symbolsToFetch.length) {
      console.warn(`⚠️ Stock count mismatch: expected ${symbolsToFetch.length}, got ${stocks.length}`);
    }

    // Store prices when market closes
    if (isMarketClosedForDay() && !marketClosePrices && stocks.length > 0) {
      marketClosePrices = {};
      stocks.forEach(stock => {
        marketClosePrices[stock.symbol] = { 
          ...stock, 
          isClosingPrice: true,
          storedAt: new Date().toISOString()
        };
      });
      console.log(`💾 Stored ${stocks.length} closing prices for the day`);
    }
    
    console.log(`🎯 Final result: ${stocks.length} stocks loaded`);
    return stocks;
  } catch (error) {
    console.error('❌ Critical error fetching stocks:', error);
    // Return fallback data for all requested symbols
    const symbolsToFetch = limit ? NSE_SYMBOLS.slice(0, limit) : NSE_SYMBOLS;
    const fallbackStocks = symbolsToFetch.map(symbol => getFallbackStockData(symbol));
    console.log(`🔄 Critical fallback: Returning ${fallbackStocks.length} fallback stocks`);
    return fallbackStocks;
  }
};

// Explicit function to fetch ALL stocks without limits
export const fetchAllStocks = async () => {
  console.log('🚀 fetchAllStocks called - fetching ALL stocks');
  const allStocks = await fetchTopStocks(null);
  console.log(`🚀 fetchAllStocks returning: ${allStocks.length} stocks`);
  return allStocks;
};

export const fetchStockDetails = async (symbol) => {
  try {
    console.log(`📊 Fetching details for ${symbol}...`);
    
    const response = await axios.get(`${YAHOO_FINANCE_BASE_URL}/v6/finance/quote`, {
      headers: {
        'X-API-KEY': YAHOO_API_KEY,
        'Content-Type': 'application/json'
      },
      params: {
        symbols: `${symbol}.NS`
      },
      timeout: 8000
    });

    const data = response.data;
    
    if (data?.quoteResponse?.result?.[0]) {
      const stockData = data.quoteResponse.result[0];
      
      return {
        symbol: symbol,
        name: stockData.longName || stockData.shortName || symbol,
        price: stockData.regularMarketPrice?.toFixed(2) || '0.00',
        change: stockData.regularMarketChange?.toFixed(2) || '0.00',
        changePercent: stockData.regularMarketChangePercent?.toFixed(2) || '0.00',
        open: stockData.regularMarketOpen?.toFixed(2) || '0.00',
        high: stockData.regularMarketDayHigh?.toFixed(2) || '0.00',
        low: stockData.regularMarketDayLow?.toFixed(2) || '0.00',
        volume: stockData.regularMarketVolume || 0,
        previousClose: stockData.regularMarketPreviousClose?.toFixed(2) || '0.00',
        marketCap: formatMarketCap(stockData.marketCap),
        peRatio: stockData.trailingPE?.toFixed(2) || 'N/A',
        sector: getSector(symbol),
        dividendYield: stockData.dividendYield ? (stockData.dividendYield * 100).toFixed(2) + '%' : 'N/A',
        yearHigh: stockData.fiftyTwoWeekHigh?.toFixed(2) || 'N/A',
        yearLow: stockData.fiftyTwoWeekLow?.toFixed(2) || 'N/A',
        avgVolume: stockData.averageVolume?.toLocaleString() || 'N/A',
        beta: stockData.beta?.toFixed(2) || 'N/A',
        lastUpdated: new Date().toISOString(),
        isRealData: true
      };
    }
    
    throw new Error('No valid data received');
  } catch (error) {
    console.error(`❌ Error fetching details for ${symbol}:`, error.message);
    // Return fallback data
    return getFallbackStockData(`${symbol}.NS`);
  }
};

export const fetchStockHistory = async (symbol, interval = '1d', range = '1mo') => {
  try {
    console.log(`📈 Fetching history for ${symbol}...`);
    
    const response = await axios.get(`${YAHOO_FINANCE_BASE_URL}/v8/finance/chart/${symbol}.NS`, {
      headers: {
        'X-API-KEY': YAHOO_API_KEY,
        'Content-Type': 'application/json'
      },
      params: {
        interval: interval,
        range: range
      },
      timeout: 8000
    });

    const data = response.data;
    
    if (data?.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      const ohlcData = timestamps.map((timestamp, index) => ({
        time: timestamp * 1000,
        open: parseFloat(quotes.open[index]) || 0,
        high: parseFloat(quotes.high[index]) || 0,
        low: parseFloat(quotes.low[index]) || 0,
        close: parseFloat(quotes.close[index]) || 0,
        volume: parseInt(quotes.volume[index]) || 0
      })).filter(item => item.open > 0 && item.high > 0 && item.low > 0 && item.close > 0);
      
      return ohlcData;
    }
    
    throw new Error('No valid historical data received');
  } catch (error) {
    console.error(`❌ Error fetching history for ${symbol}:`, error.message);
    // Generate realistic historical data
    return generateRealisticHistory(symbol);
  }
};

const generateRealisticHistory = (symbol) => {
  const basePrices = {
    'RELIANCE': 2456, 'TCS': 3112, 'INFY': 1505, 'HDFCBANK': 1425, 'ICICIBANK': 890,
    'SBIN': 550, 'BHARTIARTL': 780, 'KOTAKBANK': 1650, 'HINDUNILVR': 2450, 'ITC': 420
  };

  const basePrice = basePrices[symbol] || 1000;
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    const volatility = 0.015;
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const newPrice = currentPrice + change;
    
    const open = currentPrice;
    const close = newPrice;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice;
    const volume = Math.floor(Math.random() * 2000000) + 500000;

    data.push({
      time: time.getTime(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });

    currentPrice = newPrice;
  }

  return data;
};

export const searchStocks = async (query) => {
  try {
    const allStocks = await fetchAllStocks();
    return allStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

// Function to get real closing prices
export const getClosingPrices = () => {
  return marketClosePrices ? Object.values(marketClosePrices) : null;
};

// Function to check if we have closing prices stored
export const hasClosingPrices = () => {
  return marketClosePrices !== null;
};

// Clear closing prices at market open
export const clearClosingPrices = () => {
  if (marketClosePrices) {
    console.log('🧹 Cleared previous closing prices');
    marketClosePrices = null;
  }
};