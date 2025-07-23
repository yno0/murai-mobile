import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, AlertTriangle, Eye, TrendingUp, Users, Clock, MapPin, BarChart3, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import DetectionAnalytics from './components/DetectionAnalytics';

const Detection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Sample data
  const detectionStats = [
    { title: 'Total Detections', value: '2,847', change: '+12%', icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bg: 'bg-red-50' },
    { title: 'Active Monitors', value: '24', change: '+3', icon: Eye, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { title: 'Platforms Tracked', value: '8', change: '0', icon: MapPin, gradient: 'from-green-500 to-green-600', bg: 'bg-green-50' },
    { title: 'Response Time', value: '1.2s', change: '-0.3s', icon: Clock, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' }
  ];

  const recentDetections = [
    {
      id: 1,
      content: 'Inappropriate language detected',
      platform: 'Facebook',
      type: 'Profanity',
      severity: 'High',
      timestamp: '2024-01-15 14:30',
      user: 'john_doe123'
    },
    {
      id: 2,
      content: 'Hate speech content identified',
      platform: 'Twitter',
      type: 'Slur',
      severity: 'Critical',
      timestamp: '2024-01-15 14:25',
      user: 'anonymous_user'
    },
    {
      id: 3,
      content: 'Sensitive content warning',
      platform: 'Reddit',
      type: 'Sensitive',
      severity: 'Medium',
      timestamp: '2024-01-15 14:20',
      user: 'reddit_user456'
    },
    {
      id: 4,
      content: 'Offensive comment detected',
      platform: 'YouTube',
      type: 'Profanity',
      severity: 'High',
      timestamp: '2024-01-15 14:15',
      user: 'video_watcher'
    }
  ];

  const topCategories = [
    { category: 'Profanity', count: 1284, percentage: 45, gradient: 'from-red-500 to-red-600' },
    { category: 'Hate Speech', count: 856, percentage: 30, gradient: 'from-orange-500 to-orange-600' },
    { category: 'Sensitive Content', count: 512, percentage: 18, gradient: 'from-yellow-500 to-yellow-600' },
    { category: 'Spam', count: 195, percentage: 7, gradient: 'from-blue-500 to-blue-600' }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'High': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'Medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getPlatformIcon = (platform) => {
    return platform.charAt(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Content Detection Hub
              </h1>
              <p className="text-gray-600 text-lg">Monitor and analyze content across multiple platforms in real-time</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex items-center gap-2 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                <Calendar className="w-4 h-4" />
                Last 30 Days
              </Button>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {detectionStats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    {stat.change}
        </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Section */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1 rounded-2xl">
              <TabsTrigger value="overview" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">
                <PieChart className="w-4 h-4" />
                Detailed
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Detection List */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl">
                  <div className="p-8 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h2 className="text-2xl font-bold text-gray-900">Recent Detections</h2>
                      <div className="flex gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search detections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/50 backdrop-blur-sm">
                          <Filter className="w-4 h-4" />
                          Filter
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-0">
                    <div className="space-y-0">
                      {recentDetections.map((detection) => (
                        <div key={detection.id} className="p-6 hover:bg-gray-50/50 transition-all duration-300">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-sm font-medium shadow-lg">
                                {getPlatformIcon(detection.platform)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge className={`${getSeverityColor(detection.severity)} rounded-full px-3 py-1`}>
                                    {detection.severity}
                                  </Badge>
                                  <span className="text-sm text-gray-600">{detection.platform}</span>
                                  <span className="text-sm text-gray-400">•</span>
                                  <span className="text-sm text-gray-600">{detection.user}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{detection.content}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Type: {detection.type}</span>
                                  <span>{detection.timestamp}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-100/50 rounded-xl">
                              View Details
                            </Button>
                          </div>
                </div>
              ))}
            </div>
          </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Filters</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="All Platforms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="reddit">Reddit</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="profanity">Profanity</SelectItem>
                          <SelectItem value="slur">Hate Speech</SelectItem>
                          <SelectItem value="sensitive">Sensitive Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg">
                      Apply Filters
                    </Button>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Detection Categories</h3>
                  <div className="space-y-4">
                    {topCategories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{category.category}</span>
                          <span className="text-sm text-gray-600">{category.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full bg-gradient-to-r ${category.gradient} transition-all duration-500`}
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white text-xs font-medium`}>
                            {category.percentage}%
                          </div>
                          <span className="text-gray-500">of total</span>
                        </div>
                </div>
              ))}
            </div>
          </div>
              </div>
            </div>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Advanced Analytics */}
              <div className="lg:col-span-2 space-y-6">
                {/* 24-Hour Activity Heatmap */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">24-Hour Activity Heatmap</h3>
                  <div className="grid grid-cols-24 gap-1 h-32">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 cursor-pointer shadow-sm">
                        <div className="text-xs text-gray-500 text-center mt-1">{i}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>12 AM</span>
                    <span>12 PM</span>
                    <span>12 AM</span>
                  </div>
                </div>

                {/* Platform Performance */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Performance Analysis</h3>
                  <div className="space-y-4">
                    {['Facebook', 'Twitter', 'Reddit', 'YouTube'].map((platform) => (
                      <div key={platform} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center text-sm font-medium shadow-lg">
                            {platform.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900">{platform}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{(Math.random() * 1000).toFixed(0)}</div>
                            <div className="text-xs text-gray-500">Detections</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">+{(Math.random() * 20).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">vs last week</div>
                          </div>
                        </div>
                </div>
              ))}
            </div>
          </div>
        </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Detection Trends */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Trends</h3>
                  <div className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">{day}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full transition-all duration-500"
                              style={{ width: `${Math.random() * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">
                            {(Math.random() * 500).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Time Analysis */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Response Time Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Response</span>
                      <span className="font-semibold text-gray-900">1.2s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fastest Response</span>
                      <span className="font-semibold text-green-600">0.8s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Slowest Response</span>
                      <span className="font-semibold text-red-600">3.1s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <DetectionAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Detection; 