import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Users, FileText, Eye, Share2, MessageSquare, TrendingUp } from 'lucide-react';

const DashboardMetrics = () => {
  // This would be replaced with real data from your API
  const dummyData = {
    pageViews: [
      { date: '2024-01', views: 2300 },
      { date: '2024-02', views: 3400 },
      { date: '2024-03', views: 4200 },
    ],
    metrics: {
      totalUsers: 1250,
      totalPosts: 456,
      totalSubscriptions: 890,
      totalComments: 2345,
      totalShares: 678,
      totalPageViews: 12500,
      avgEngagementRate: 8.5
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total Users</p>
                <h3 className="text-2xl font-bold">{dummyData.metrics.totalUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total Posts</p>
                <h3 className="text-2xl font-bold">{dummyData.metrics.totalPosts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total Comments</p>
                <h3 className="text-2xl font-bold">{dummyData.metrics.totalComments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Engagement Rate</p>
                <h3 className="text-2xl font-bold">{dummyData.metrics.avgEngagementRate}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyData.pageViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity items would go here */}
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500" />
                <span className="ml-2">New user registration</span>
                <span className="ml-auto text-sm text-gray-500">2m ago</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="ml-2">New post published</span>
                <span className="ml-auto text-sm text-gray-500">5m ago</span>
              </div>
              <div className="flex items-center">
                <Share2 className="h-5 w-5 text-gray-500" />
                <span className="ml-2">Post shared on Twitter</span>
                <span className="ml-auto text-sm text-gray-500">10m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;