'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueData {
  date: string;
  daily_revenue: string;
}

interface BarGraphProps {
  revenueData: RevenueData[];
}

export function BarGraph({ revenueData }: BarGraphProps) {
  // Transform the data for the chart
  const chartData = revenueData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    revenue: Number(item.daily_revenue)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(value) => `Rs.${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [
                  `Rs.${Number(value).toLocaleString()}`,
                  'Revenue'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
