import { useEffect, useState } from "react";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from "recharts";

const startData = [
  { name: "Q1", emp: 0, prom: 0 },
  { name: "Q2", emp: 0, prom: 0 },
  { name: "Q3", emp: 0, prom: 0 },
  { name: "Q4", emp: 0, prom: 0 },
];
const realData = [
  { name: "Q1", emp: 44, prom: 6 },
  { name: "Q2", emp: 51, prom: 8 },
  { name: "Q3", emp: 63, prom: 7 },
  { name: "Q4", emp: 68, prom: 10 },
];

export default function EmployeeStack() {
  const [data, setData] = useState(startData);
  useEffect(() => {
    setTimeout(() => setData(realData), 450);
  }, []);
  return (
    <ResponsiveContainer width="100%" height="95%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="2 2" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="emp" barSize={18} fill="#6366F1" />
        <Line type="monotone" dataKey="prom" stroke="#14b8a6" strokeWidth={3} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
