"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface MovieRevenueChartProps {
  data: { title: string; revenue: number; bookings: number }[];
}

export function MovieRevenueChart({ data }: MovieRevenueChartProps) {
  // Truncate long titles for the X-Axis
  const formattedData = data.map(item => ({
    ...item,
    shortTitle: item.title.length > 15 ? item.title.substring(0, 15) + "..." : item.title
  }));

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="shortTitle" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
            itemStyle={{ color: "#fff" }}
            cursor={{ fill: "#ffffff10" }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#3b82f6" // Blue
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
