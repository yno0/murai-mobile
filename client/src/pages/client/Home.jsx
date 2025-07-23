import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Bell, HelpCircle, Power, Settings, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const quickActions = [
    {
      title: 'Detections',
      description: 'Review flagged content',
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      path: '/client/detections',
      color: 'blue'
    },
    {
      title: 'Groups',
      description: 'Manage your groups',
      icon: <Users className="w-6 h-6 text-green-500" />,
      path: '/client/group',
      color: 'green'
    },
    {
      title: 'Extension',
      description: 'Configure the extension',
      icon: <Settings className="w-6 h-6 text-purple-500" />,
      path: '/client/extension',
      color: 'purple'
    },
    {
      title: 'Help & Support',
      description: 'Get help and support',
      icon: <HelpCircle className="w-6 h-6 text-orange-500" />,
      path: '/client/help',
      color: 'orange'
    }
  ];

  const recentActivity = [
    { id: 1, type: 'detection', content: 'Profanity detected on Facebook', time: '2 hours ago' },
    { id: 2, type: 'group', content: 'You were added to "Project Team"', time: '1 day ago' },
    { id: 3, type: 'extension', content: 'Extension settings updated', time: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name || user?.email || 'User'}!
          </h1>
          <p className="text-gray-500 mt-1">Here’s your dashboard overview for today.</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className={`hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-${action.color}-500`}
              onClick={() => navigate(action.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{action.title}</CardTitle>
                {action.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-full mr-4">
                        <Bell className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{activity.content}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/client/detections')}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats & Extension Status */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Detections this week</p>
                  <p className="font-bold text-lg text-gray-800">142</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Groups</p>
                  <p className="font-bold text-lg text-gray-800">5</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Extension Status</span>
                  <Power className="w-5 h-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-gray-600">Murai is currently active.</p>
                <Switch defaultChecked />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
 