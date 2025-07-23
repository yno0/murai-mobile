import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { CheckCircle, ChevronDown, ChevronUp, Download, FileText, Flag, Maximize2, Users, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import AdminLayout from '../../layouts/AdminLayout';

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

// KPI mock data with Lucide icons (all blue)
const kpis = [
  {
    label: 'Total Flagged',
    value: 1287,
    icon: <Flag className="w-6 h-6 text-blue-600" />, // Lucide blue
    trend: '+12% from last week',
  },
  {
    label: 'Active Users',
    value: 342,
    icon: <Users className="w-6 h-6 text-blue-600" />, // Lucide blue
    trend: '+5% from last week',
  },
  {
    label: 'Reports',
    value: 87,
    icon: <FileText className="w-6 h-6 text-blue-600" />, // Lucide blue
    trend: '-3% from last week',
  },
  {
    label: 'Accuracy Rate',
    value: '92%',
    icon: <CheckCircle className="w-6 h-6 text-blue-600" />, // Lucide blue
    trend: '+1% from last week',
  },
];

const flaggedTrendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Flagged Content',
      data: [120, 150, 180, 90, 200, 170, 140],
      backgroundColor: 'rgba(37,99,235,0.8)', // blue-600
      borderRadius: 8,
    },
  ],
};

const sentimentPieData = {
  labels: ['Positive', 'Neutral', 'Negative'],
  datasets: [
    {
      data: [40, 35, 25],
      backgroundColor: [
        'rgba(37,99,235,0.8)', // blue-600
        'rgba(203,213,225,0.8)', // gray-300
        'rgba(71,85,105,0.8)', // gray-700
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  ],
};

const languageBarData = {
  labels: ['Filipino', 'English'],
  datasets: [
    {
      label: 'Frequency',
      data: [532, 755],
      backgroundColor: [
        'rgba(37,99,235,0.8)', // blue-600
        'rgba(203,213,225,0.8)', // gray-300
      ],
      borderRadius: 8,
    },
  ],
};

const sourcePieData = {
  labels: ['Facebook', 'Twitter', 'Reddit', 'YouTube'],
  datasets: [
    {
      data: [60, 25, 10, 5],
      backgroundColor: [
        'rgba(37,99,235,0.8)', // blue-600
        'rgba(203,213,225,0.8)', // gray-300
        'rgba(203,213,225,0.6)', // lighter gray
        'rgba(71,85,105,0.8)', // gray-700
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  ],
};

const accuracyData = {
  labels: ['True Positives', 'False Positives'],
  datasets: [
    {
      data: [92, 8],
      backgroundColor: [
        'rgba(37,99,235,0.8)', // blue-600
        'rgba(203,213,225,0.8)', // gray-300
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  ],
};

const mostFlaggedWords = [
  { word: 'idiot', count: 120 },
  { word: 'tanga', count: 95 },
  { word: 'stupid', count: 80 },
  { word: 'bobo', count: 60 },
  { word: 'dumb', count: 45 },
];

const detailedMetrics = [
  { label: 'Peak Hour', value: '2:00 PM - 4:00 PM', description: 'Highest flagged content activity' },
  { label: 'Response Time', value: '1.2s', description: 'Average detection time' },
  { label: 'False Positive Rate', value: '8%', description: 'Incorrectly flagged content' },
  { label: 'User Appeals', value: '23', description: 'Content appeals this week' },
  { label: 'Auto-moderated', value: '87%', description: 'Automatically handled flags' },
  { label: 'Manual Review', value: '13%', description: 'Required human intervention' },
];

const chartOptions = {
  plugins: { 
    legend: { 
      display: false,
      labels: {
        color: '#000000'
      }
    }
  }, 
  responsive: true, 
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: '#000000'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    y: {
      ticks: {
        color: '#000000'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  }
};

const pieOptions = {
  plugins: { 
    legend: { 
      position: 'bottom',
      labels: {
        color: '#000000'
      }
    }
  }, 
  responsive: true, 
  maintainAspectRatio: false
};

function ChartModal({ open, onClose, children, title, onDownload }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl relative animate-fade-in">
        <button
          className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100 text-gray-500"
          onClick={onClose}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {onDownload && (
            <button
              className="p-2 rounded hover:bg-blue-50 text-blue-600"
              onClick={onDownload}
              title="Download chart"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="h-[400px] flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}

function OverviewDashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <Card
            key={idx}
            className="border-0 shadow-md rounded-2xl transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm"
            style={{ minHeight: 120 }}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
                {kpi.icon}
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 leading-tight">{kpi.value}</div>
                <div className="text-gray-600 text-base font-medium mt-1">{kpi.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Basic Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Weekly Flagged Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={flaggedTrendData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Content Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Pie data={sentimentPieData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">755</div>
              <div className="text-gray-600 text-base mt-1">English Content</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">532</div>
              <div className="text-gray-600 text-base mt-1">Filipino Content</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">60%</div>
              <div className="text-gray-600 text-base mt-1">From Facebook</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailedDashboard() {
  const [filter, setFilter] = useState('week');
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(null); // 'bar' | 'pie' | 'accuracy' | 'line'
  const lineChartRef = useRef();
  const barChartRef = useRef();
  const pieChartRef = useRef();
  const accuracyChartRef = useRef();

  // Download handler for chart.js charts
  const handleDownload = (ref, name) => {
    if (ref.current) {
      const url = ref.current.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = name + '.png';
      link.click();
    }
  };

  return (
    <div className="space-y-8">
      {/* Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">Filter:</span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Detailed KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <Card
            key={idx}
            className="border-0 shadow-md rounded-2xl transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm"
            style={{ minHeight: 120 }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100">
                  {kpi.icon}
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 leading-tight">{kpi.value}</div>
                  <div className="text-gray-600 text-base font-medium mt-1">{kpi.label}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Language Distribution</CardTitle>
              <CardDescription>Frequency of inappropriate words by language</CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 rounded hover:bg-blue-50 text-blue-600"
                title="Zoom"
                onClick={() => setZoomed('bar')}
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded hover:bg-blue-50 text-blue-600"
                title="Download chart"
                onClick={() => handleDownload(barChartRef, 'language-distribution')}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <Bar ref={barChartRef} data={languageBarData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Content Sources</CardTitle>
              <CardDescription>Platform breakdown of flagged content</CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 rounded hover:bg-blue-50 text-blue-600"
                title="Zoom"
                onClick={() => setZoomed('pie')}
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded hover:bg-blue-50 text-blue-600"
                title="Download chart"
                onClick={() => handleDownload(pieChartRef, 'content-sources')}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <Pie ref={pieChartRef} data={sourcePieData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Moderation Accuracy</CardTitle>
              <CardDescription>True vs False Positives</CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 rounded hover:bg-blue-50 text-blue-600"
                title="Zoom"
                onClick={() => setZoomed('accuracy')}
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded hover:bg-blue-50 text-blue-600"
                title="Download chart"
                onClick={() => handleDownload(accuracyChartRef, 'moderation-accuracy')}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <Pie ref={accuracyChartRef} data={accuracyData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Weekly Trend Analysis</CardTitle>
            <CardDescription>Detailed view of flagged content over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded hover:bg-blue-50 text-blue-600"
              title="Zoom"
              onClick={() => setZoomed('line')}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded hover:bg-blue-50 text-blue-600"
              title="Download chart"
              onClick={() => handleDownload(lineChartRef, 'weekly-trend')}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line ref={lineChartRef} data={flaggedTrendData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Chart Modals for Zoom */}
      <ChartModal
        open={zoomed === 'bar'}
        onClose={() => setZoomed(null)}
        title="Language Distribution"
        onDownload={() => handleDownload(barChartRef, 'language-distribution')}
      >
        <Bar ref={barChartRef} data={languageBarData} options={chartOptions} />
      </ChartModal>
      <ChartModal
        open={zoomed === 'pie'}
        onClose={() => setZoomed(null)}
        title="Content Sources"
        onDownload={() => handleDownload(pieChartRef, 'content-sources')}
      >
        <Pie ref={pieChartRef} data={sourcePieData} options={pieOptions} />
      </ChartModal>
      <ChartModal
        open={zoomed === 'accuracy'}
        onClose={() => setZoomed(null)}
        title="Moderation Accuracy"
        onDownload={() => handleDownload(accuracyChartRef, 'moderation-accuracy')}
      >
        <Pie ref={accuracyChartRef} data={accuracyData} options={pieOptions} />
      </ChartModal>
      <ChartModal
        open={zoomed === 'line'}
        onClose={() => setZoomed(null)}
        title="Weekly Trend Analysis"
        onDownload={() => handleDownload(lineChartRef, 'weekly-trend')}
      >
        <Line ref={lineChartRef} data={flaggedTrendData} options={chartOptions} />
      </ChartModal>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Most Flagged Words</CardTitle>
            <CardDescription>Top inappropriate words detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostFlaggedWords.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">{item.word}</span>
                  <span className="font-bold text-gray-900 bg-blue-100 px-2 py-1 rounded text-sm">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expandable Comprehensive Metrics */}
        <Card className="border-0 shadow-md rounded-2xl bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setExpanded(e => !e)}>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Detailed Metrics</CardTitle>
              <CardDescription>Comprehensive system performance</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {expanded && (
                <button
                  className="p-2 rounded hover:bg-blue-50 text-blue-600"
                  title="Download metrics"
                  onClick={e => { e.stopPropagation(); window.print(); }}
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </div>
          </CardHeader>
          {expanded && (
            <CardContent>
              <div className="space-y-4">
                {detailedMetrics.map((metric, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{metric.label}</div>
                        <div className="text-sm text-gray-600">{metric.description}</div>
                      </div>
                      <div className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">
                        {metric.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Analytics</h1>
            <p className="text-gray-600">Monitor and analyze content moderation performance</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="overview" className="text-sm font-medium">
                Overview
              </TabsTrigger>
              <TabsTrigger value="detailed" className="text-sm font-medium">
                Detailed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <OverviewDashboard />
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              <DetailedDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}