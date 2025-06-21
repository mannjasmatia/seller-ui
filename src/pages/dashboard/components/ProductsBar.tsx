// Helper Components (shared across components)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FilterState } from '../types.dashboard';
import { useMemo } from 'react';


// ProductsBarChart.tsx - Chart component with internal data management
const ProductsBarChart = ({
  title,
  filterState,
  dataKey,
  type,
}: {
  title: string;
  filterState: FilterState;
  dataKey: string;
  type: 'products' | 'profit';
}) => {
  // Function to calculate optimal granularity based on date range
  const calculateGranularity = (fromDate: Date, toDate: Date): 'days' | 'weeks' | 'months' | 'years' => {
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'days';
    if (diffDays <= 90) return 'weeks';
    if (diffDays <= 730) return 'months';
    return 'years';
  };

  // Function to generate date periods based on granularity
  const generateDatePeriods = (fromDate: Date, toDate: Date, granularity: 'days' | 'weeks' | 'months' | 'years'): string[] => {
    const periods: string[] = [];
    const current = new Date(fromDate);
    
    switch (granularity) {
      case 'days':
        while (current <= toDate) {
          periods.push(current.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }));
          current.setDate(current.getDate() + 1);
        }
        break;
        
      case 'weeks':
        while (current <= toDate) {
          const weekStart = new Date(current);
          const weekEnd = new Date(current);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          if (weekEnd > toDate) weekEnd.setTime(toDate.getTime());
          
          periods.push(`${weekStart.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })} - ${weekEnd.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}`);
          
          current.setDate(current.getDate() + 7);
        }
        break;
        
      case 'months':
        while (current <= toDate) {
          periods.push(current.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          }));
          current.setMonth(current.getMonth() + 1);
        }
        break;
        
      case 'years':
        while (current <= toDate) {
          periods.push(current.getFullYear().toString());
          current.setFullYear(current.getFullYear() + 1);
        }
        break;
    }
    
    return periods;
  };

  // Generate chart data based on filters
  const chartData = useMemo(() => {
    // Handle custom date range
    if (filterState.timeGranularity === 'custom' && filterState.customFromDate && filterState.customToDate) {
      const fromDate = new Date(filterState.customFromDate);
      const toDate = new Date(filterState.customToDate);
      const autoGranularity = calculateGranularity(fromDate, toDate);
      const periods = generateDatePeriods(fromDate, toDate, autoGranularity);
      
      // Generate random data for custom periods based on type
      return periods.map((period) => ({
        period,
        [dataKey]: type === 'products' 
          ? Math.floor(Math.random() * 1000) + 500
          : Math.floor(Math.random() * 800) + 400,
      }));
    }

    // Predefined data for standard time periods
    const data: { [key: string]: { periods: string[], values: number[] } } = {
      'all-time': {
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        values: type === 'products' ? [600, 900, 1200, 2000, 2500] : [600, 900, 1200, 2000, 2500],
      },
      'this-week': {
        periods: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: type === 'products' ? [150, 200, 180, 220, 300, 350, 280] : [120, 160, 140, 180, 240, 280, 220],
      },
      'this-month': {
        periods: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: type === 'products' ? [800, 950, 1100, 1200] : [650, 780, 900, 980],
      },
      'this-year': {
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: type === 'products' 
          ? [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700]
          : [480, 560, 640, 720, 800, 880, 960, 1040, 1120, 1200, 1280, 1360],
      },
      'last-2-years': {
        periods: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4'],
        values: type === 'products' 
          ? [2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600]
          : [1800, 1950, 2100, 2250, 2400, 2550, 2700, 2850],
      },
      'last-5-years': {
        periods: ['2020', '2021', '2022', '2023', '2024'],
        values: type === 'products' ? [8000, 9500, 11000, 12500, 14000] : [6500, 7800, 9000, 10200, 11500],
      },
    };

    const selected = data[filterState.timeGranularity] || data['all-time'];
    
    return selected.periods.map((period, index) => ({
      period,
      [dataKey]: selected.values[index] || 0,
    }));
  }, [filterState, dataKey, type]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 ">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => type === 'profit' ? `$${value}` : value.toString()}
            />
            <Tooltip content={<CustomTooltip type={type} />} />
            <Bar 
              dataKey={dataKey} 
              fill="#dc2626" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const dataKey = type === 'products' ? 'Products Sold' : 'Profit Generated';
    const prefix = type === 'profit' ? '$' : '';
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-red-600">
          {dataKey}: {prefix}{value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default ProductsBarChart;