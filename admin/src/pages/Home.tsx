import React, { useState, useEffect } from 'react';
import Wrapper from '../components/Wrapper';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { API } from '../api'; // Your API client (e.g., Axios)

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Listing {
  date: string;
  listings: number;
}

interface Property {
  _id: string;
  PropertyName: string;
  createdAt: string; // Assuming createdAt is a string (ISO date)
  // Other fields as needed
}

const aggregateData = (data: Property[], period: 'daily' | 'weekly' | 'monthly'): Listing[] => {
  const aggregated: { [key: string]: number } = {};
  data.forEach((item) => {
    const date = new Date(item.createdAt);
    let key: string;
    if (period === 'daily') {
      key = item.createdAt.split('T')[0]; // e.g., "2025-01-01"
    } else if (period === 'weekly') {
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
      key = startOfWeek.toISOString().split('T')[0]; // Start of the week
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // e.g., "2025-01"
    }

    if (!aggregated[key]) {
      aggregated[key] = 0;
    }
    aggregated[key] += 1; // Count each property as one listing
  });

  return Object.entries(aggregated)
    .map(([key, listings]) => ({ date: key, listings }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const ListingsChart: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties from the backend
useEffect(() => {
  const fetchProperties = async () => {
    try {
      const response = await API.get('/property/properties');
      const data = response.data;
      if (data.success) {
        setProperties(data.properties);
      } else {
        setError('Failed to fetch properties');
      }
    } catch (err) {
      setError('Error fetching properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
}, []);

  const aggregatedData = aggregateData(properties, period);

  const chartData: ChartData<'line'> = {
    labels: aggregatedData.map((item) => item.date),
    datasets: [
      {
        label: 'Listings',
        data: aggregatedData.map((item) => item.listings),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            family: 'secondaryFont',
          },
        },
      },
      title: {
        display: true,
        text: `Listings (${period.charAt(0).toUpperCase() + period.slice(1)})`,
        color: '#ffffff',
        font: {
          family: 'secondaryFont',
          size: 18,
        },
      },
      tooltip: {
        backgroundColor: '#162042',
        titleFont: { family: 'secondaryFont' },
        bodyFont: { family: 'secondaryFont' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-6 bg-[#101828] rounded-lg">
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-md secondaryFont text-sm ${
              period === 'daily' ? 'bg-[#162042] text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-[#1d2a5b]`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-md secondaryFont text-sm ${
              period === 'weekly' ? 'bg-[#162042] text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-[#1d2a5b]`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-md secondaryFont text-sm ${
              period === 'monthly' ? 'bg-[#162042] text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-[#1d2a5b]`}
          >
            Monthly
          </button>
        </div>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <Wrapper>
      <div className="w-full min-h-screen bg-[#101828] p-4">
        <ListingsChart />
      </div>
    </Wrapper>
  );
};

export default Home;