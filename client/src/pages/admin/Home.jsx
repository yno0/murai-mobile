import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, FileText, Flag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

const kpis = [
  {
    label: 'Total Flagged',
    value: 1287,
    icon: <Flag className="w-8 h-8 text-blue-600" />,
    path: '/admin/detections'
  },
  {
    label: 'Active Users',
    value: 342,
    icon: <Users className="w-8 h-8 text-green-600" />,
    path: '/admin/users'
  },
  {
    label: 'Reports',
    value: 87,
    icon: <FileText className="w-8 h-8 text-orange-600" />,
    path: '/admin/reports'
  },
  {
    label: 'Accuracy Rate',
    value: '92%',
    icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
    path: '/admin/sentiment-model'
  },
];

const quickLinks = [
  { title: 'Review Detections', path: '/admin/detections' },
  { title: 'Manage Users', path: '/admin/users' },
  { title: 'View Reports', path: '/admin/reports' },
  { title: 'Sentiment Model', path: '/admin/sentiment-model' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Home</h1>
          <p className="text-gray-600">Welcome back, Admin! Here's a summary of the platform.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.isArray(kpis) && kpis.map((kpi, idx) => (
            <Card
              key={idx}
              className="border-0 shadow-md rounded-2xl transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm cursor-pointer"
              onClick={() => navigate(kpi.path)}
            >
              <CardContent className="flex items-center gap-6 p-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gray-100">
                  {kpi.icon}
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 leading-tight">{kpi.value}</div>
                  <div className="text-gray-600 text-lg font-medium mt-1">{kpi.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to key areas of the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.isArray(quickLinks) && quickLinks.map((link, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  className="justify-between w-full h-16 text-lg"
                  onClick={() => navigate(link.path)}
                >
                  {link.title}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
