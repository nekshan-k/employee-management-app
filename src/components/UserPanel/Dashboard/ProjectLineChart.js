import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const startData = [
  { name: "Mon", value: 0 }, { name: "Tue", value: 0 }, { name: "Wed", value: 0 },
  { name: "Thu", value: 0 }, { name: "Fri", value: 0 }, { name: "Sat", value: 0 }, { name: "Sun", value: 0 }
];
const realData = [
  { name: "Mon", value: 75 },
  { name: "Tue", value: 100 },
  { name: "Wed", value: 68 },
  { name: "Thu", value: 123 },
  { name: "Fri", value: 89 },
  { name: "Sat", value: 142 },
  { name: "Sun", value: 55 }
];

export default function ProjectLineChart() {
  const [data, setData] = useState(startData);
  useEffect(() => {
    setTimeout(() => setData(realData), 600);
  }, []);
  return (
    <ResponsiveContainer width="100%" height="92%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} isAnimationActive dot />
      </LineChart>
    </ResponsiveContainer>
  );
}
