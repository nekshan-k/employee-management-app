import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const startData = [
  { month: "Jan", growth: 0 },
  { month: "Feb", growth: 0 },
  { month: "Mar", growth: 0 },
  { month: "Apr", growth: 0 },
  { month: "May", growth: 0 },
  { month: "Jun", growth: 0 },
];
const realData = [
  { month: "Jan", growth: 20 },
  { month: "Feb", growth: 28 },
  { month: "Mar", growth: 55 },
  { month: "Apr", growth: 47 },
  { month: "May", growth: 80 },
  { month: "Jun", growth: 96 },
];

export default function GrowthAreaChart() {
  const [data, setData] = useState(startData);
  useEffect(() => {
    setTimeout(() => setData(realData), 500);
  }, []);
  return (
    <ResponsiveContainer width="100%" height="92%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="growth" stroke="#6366F1" fillOpacity={1} fill="url(#c)" isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}
