import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useViewsOverTime } from '@/hooks/useAnalytics';
import { Loader2 } from 'lucide-react';

export default function ViewsTrendChart() {
  const { data: viewsData, isLoading } = useViewsOverTime(30);

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Views Over the Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (!viewsData || !Array.isArray(viewsData) || viewsData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Views Over the Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-gray-500">
          <p>No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Views Over the Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">  {/* keeps your original constraint */}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart 
              data={viewsData} 
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                formatter={(value: number) => [value.toLocaleString(), 'Views']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}