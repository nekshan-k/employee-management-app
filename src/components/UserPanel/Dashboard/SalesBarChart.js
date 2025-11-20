import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const startData = [
  { name: "Jan", uv: 0 }, { name: "Feb", uv: 0 }, { name: "Mar", uv: 0 },
  { name: "Apr", uv: 0 }, { name: "May", uv: 0 }, { name: "Jun", uv: 0 },
];
const realData = [
  { name: "Jan", uv: 140 }, { name: "Feb", uv: 115 }, { name: "Mar", uv: 150 },
  { name: "Apr", uv: 180 }, { name: "May", uv: 130 }, { name: "Jun", uv: 200 },
];

export default function SalesBarChart() {
  const [data, setData] = useState(startData);
  useEffect(() => {
    setTimeout(() => setData(realData), 250);
  }, []);
  return (
    <ResponsiveContainer width="100%" height="95%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="uv" fill="#6366F1" radius={[5,5,0,0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
