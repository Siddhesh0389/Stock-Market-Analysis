// components/PriceChart.jsx
import CandleChart from './CandleChart';

const PriceChart = ({ data, color = '#3B82F6' }) => {
  return (
    <div className="h-80">
      <CandleChart data={data} color={color} height={80} />
    </div>
  );
};

export default PriceChart;