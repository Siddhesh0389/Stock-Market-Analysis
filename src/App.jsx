// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StockDetails from './pages/StockDetails';
import Header from './components/Header';
import Footer from './components/Footer';
import StocksList from './pages/StocksList';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stocks" element={<StocksList />} />
            <Route path="/stock/:symbol" element={<StockDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

// api- awYBybEFtkapU9rYCpv5B9oEnWPIoQeM2YrEy0dc