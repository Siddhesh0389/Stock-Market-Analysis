// utils/marketHours.js - Updated with holiday calendar
// NSE Market Hours in IST
export const MARKET_HOURS = {
  PRE_OPEN: { start: 900, end: 908 },   // 9:00 AM - 9:08 AM
  OPEN: { start: 915, end: 1530 },      // 9:15 AM - 3:30 PM
  CLOSE: { start: 1530, end: 2359 }     // 3:30 PM - 11:59 PM
};

// NSE Holidays for 2025-26 (including weekends)
export const NSE_HOLIDAYS_2025 = [
  // 2025 Holidays
  '2025-01-01', // New Year's Day
  '2025-01-14', // Makar Sankranti
  '2025-01-26', // Republic Day
  '2025-03-14', // Maha Shivratri
  '2025-03-29', // Holi
  '2025-04-02', // Ram Navami
  '2025-04-14', // Dr. Babasaheb Ambedkar Jayanti
  '2025-04-18', // Good Friday
  '2025-05-01', // Maharashtra Day
  '2025-06-06', // Bakri Id
  '2025-08-15', // Independence Day
  '2025-09-05', // Ganesh Chaturthi
  '2025-10-02', // Mahatma Gandhi Jayanti
  '2025-10-23', // Dussehra
  '2025-11-04', // Diwali-Laxmi Pujan
  '2025-11-05', // Diwali-Balipratipada
  '2025-12-25', // Christmas
];

export const NSE_HOLIDAYS_2026 = [
  // 2026 Holidays
  '2026-01-01', // New Year's Day
  '2026-01-14', // Makar Sankranti
  '2026-01-26', // Republic Day
  '2026-03-03', // Maha Shivratri
  '2026-03-19', // Holi
  '2026-03-29', // Good Friday
  '2026-04-10', // Ram Navami
  '2026-04-14', // Dr. Babasaheb Ambedkar Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-05-23', // Bakri Id
  '2026-08-15', // Independence Day
  '2026-08-24', // Ganesh Chaturthi
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-12', // Dussehra
  '2026-11-02', // Diwali-Laxmi Pujan
  '2026-11-03', // Diwali-Balipratipada
  '2026-11-13', // Gurunanak Jayanti
  '2026-12-25', // Christmas
];

// Combine all holidays
export const ALL_HOLIDAYS = [...NSE_HOLIDAYS_2025, ...NSE_HOLIDAYS_2026];

// Check if a date is weekend (Saturday or Sunday)
export const isWeekend = (date = new Date()) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

// Check if a date is a market holiday
export const isMarketHoliday = (date = new Date()) => {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  return ALL_HOLIDAYS.includes(dateString);
};

// Check if market is open (considering hours, weekends, and holidays)
export const isMarketOpen = () => {
  const now = new Date();
  
  // Check if it's weekend
  if (isWeekend(now)) {
    return false;
  }
  
  // Check if it's a holiday
  if (isMarketHoliday(now)) {
    return false;
  }
  
  // Check market hours
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
  const currentTime = istTime.getHours() * 100 + istTime.getMinutes(); // HHMM format
  
  return currentTime >= MARKET_HOURS.OPEN.start && currentTime < MARKET_HOURS.OPEN.end;
};

// Check if market is closed for the day (considering all factors)
export const isMarketClosedForDay = () => {
  return !isMarketOpen();
};

// Get detailed market status
export const getMarketStatus = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const currentTime = istTime.getHours() * 100 + istTime.getMinutes();
  
  // Check weekend first
  if (isWeekend(now)) {
    return 'weekend';
  }
  
  // Check holiday
  if (isMarketHoliday(now)) {
    return 'holiday';
  }
  
  // Check market hours
  if (currentTime >= MARKET_HOURS.PRE_OPEN.start && currentTime < MARKET_HOURS.PRE_OPEN.end) {
    return 'pre_open';
  } else if (currentTime >= MARKET_HOURS.OPEN.start && currentTime < MARKET_HOURS.OPEN.end) {
    return 'open';
  } else {
    return 'closed';
  }
};

// Get next trading day (skip weekends and holidays)
export const getNextTradingDay = () => {
  let nextDay = new Date();
  
  do {
    nextDay.setDate(nextDay.getDate() + 1);
  } while (isWeekend(nextDay) || isMarketHoliday(nextDay));
  
  return nextDay;
};

// Get next market open time with proper message
export const getNextMarketOpen = () => {
  const now = new Date();
  const status = getMarketStatus();
  
  if (status === 'weekend') {
    return {
      date: getNextTradingDay(),
      message: `Next trading day: ${getNextTradingDay().toLocaleDateString()} at 9:15 AM`
    };
  }
  
  if (status === 'holiday') {
    const holidayName = getHolidayName(now);
    return {
      date: getNextTradingDay(),
      message: `Market Holiday (${holidayName}) • Next trading: ${getNextTradingDay().toLocaleDateString()} at 9:15 AM`
    };
  }
  
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const currentTime = istTime.getHours() * 100 + istTime.getMinutes();
  
  if (currentTime < MARKET_HOURS.OPEN.start) {
    // Market opens today
    const openTime = new Date(now);
    openTime.setHours(9, 15, 0, 0); // 9:15 AM IST
    return {
      date: openTime,
      message: `Opens today at 9:15 AM`
    };
  } else {
    // Market opens next trading day
    return {
      date: getNextTradingDay(),
      message: `Opens ${getNextTradingDay().toLocaleDateString()} at 9:15 AM`
    };
  }
};

// Helper function to get holiday name
const getHolidayName = (date) => {
  const dateString = date.toISOString().split('T')[0];
  const holidayNames = {
    // 2025 Holidays
    '2025-01-01': 'New Year\'s Day',
    '2025-01-14': 'Makar Sankranti',
    '2025-01-26': 'Republic Day',
    '2025-03-14': 'Maha Shivratri',
    '2025-03-29': 'Holi',
    '2025-04-02': 'Ram Navami',
    '2025-04-14': 'Dr. Babasaheb Ambedkar Jayanti',
    '2025-04-18': 'Good Friday',
    '2025-05-01': 'Maharashtra Day',
    '2025-06-06': 'Bakri Id',
    '2025-08-15': 'Independence Day',
    '2025-09-05': 'Ganesh Chaturthi',
    '2025-10-02': 'Mahatma Gandhi Jayanti',
    '2025-10-23': 'Dussehra',
    '2025-11-04': 'Diwali-Laxmi Pujan',
    '2025-11-05': 'Diwali-Balipratipada',
    '2025-12-25': 'Christmas',
    
    // 2026 Holidays
    '2026-01-01': 'New Year\'s Day',
    '2026-01-14': 'Makar Sankranti',
    '2026-01-26': 'Republic Day',
    '2026-03-03': 'Maha Shivratri',
    '2026-03-19': 'Holi',
    '2026-03-29': 'Good Friday',
    '2026-04-10': 'Ram Navami',
    '2026-04-14': 'Dr. Babasaheb Ambedkar Jayanti',
    '2026-05-01': 'Maharashtra Day',
    '2026-05-23': 'Bakri Id',
    '2026-08-15': 'Independence Day',
    '2026-08-24': 'Ganesh Chaturthi',
    '2026-10-02': 'Mahatma Gandhi Jayanti',
    '2026-10-12': 'Dussehra',
    '2026-11-02': 'Diwali-Laxmi Pujan',
    '2026-11-03': 'Diwali-Balipratipada',
    '2026-11-13': 'Gurunanak Jayanti',
    '2026-12-25': 'Christmas',
  };
  
  return holidayNames[dateString] || 'Market Holiday';
};

// Get detailed status message for display
export const getMarketStatusMessage = () => {
  const status = getMarketStatus();
  const now = new Date();
  
  switch (status) {
    case 'open':
      return {
        message: 'LIVE MARKET',
        color: 'green',
        description: 'Market is currently open for trading'
      };
    
    case 'pre_open':
      return {
        message: 'PRE-OPEN SESSION',
        color: 'blue',
        description: 'Pre-open session in progress'
      };
    
    case 'closed':
      const nextOpen = getNextMarketOpen();
      return {
        message: 'MARKET CLOSED',
        color: 'gray',
        description: nextOpen.message
      };
    
    case 'weekend':
      const nextTrading = getNextMarketOpen();
      const dayName = now.getDay() === 6 ? 'Saturday' : 'Sunday';
      return {
        message: 'WEEKEND',
        color: 'gray',
        description: `${dayName} • ${nextTrading.message}`
      };
    
    case 'holiday':
      const holidayName = getHolidayName(now);
      const nextTradingDay = getNextMarketOpen();
      return {
        message: 'MARKET HOLIDAY',
        color: 'gray',
        description: `${holidayName} • ${nextTradingDay.message}`
      };
    
    default:
      return {
        message: 'MARKET CLOSED',
        color: 'gray',
        description: 'Market is currently closed'
      };
  }
};