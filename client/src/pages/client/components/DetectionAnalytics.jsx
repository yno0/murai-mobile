import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const chartOptions = {
  plugins: { 
    legend: { 
      display: false,
    }
  }, 
  responsive: true, 
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: '#666'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    y: {
      ticks: {
        color: '#666'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }
};

const pieOptions = {
  plugins: { 
    legend: { 
      position: 'bottom',
      labels: {
        color: '#333'
      }
    }
  }, 
  responsive: true, 
  maintainAspectRatio: false
};

const detectionOverTimeData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Detections',
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      borderColor: '#4f46e5',
      tension: 0.1
    }
  ]
};

const detectionsByPlatformData = {
  labels: ['Facebook', 'Twitter', 'Reddit', 'YouTube'],
  datasets: [
    {
      label: 'Detections',
      data: [300, 50, 100, 75],
      backgroundColor: ['#3b82f6', '#0ea5e9', '#f97316', '#ef4444'],
    }
  ]
};

const sentimentDistributionData = {
  labels: ['Profanity', 'Hate Speech', 'Sensitive'],
  datasets: [
    {
      data: [60, 25, 15],
      backgroundColor: ['#ef4444', '#f97316', '#f59e0b'],
    }
  ]
};

export default function DetectionAnalytics() {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detections Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Line data={detectionOverTimeData} options={chartOptions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Detections by Platform</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Bar data={detectionsByPlatformData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detection Type Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <Pie data={sentimentDistributionData} options={pieOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
