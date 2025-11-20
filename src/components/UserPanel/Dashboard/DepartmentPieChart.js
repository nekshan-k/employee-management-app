import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4F46E5", "#06b6d4", "#fde047", "#f43f5e"];

const startData = [
  { name: "Engineering", value: 0 },
  { name: "Sales", value: 0 },
  { name: "Marketing", value: 0 },
  { name: "HR", value: 0 }
];

const realData = [
  { name: "Engineering", value: 350 },
  { name: "Sales", value: 250 },
  { name: "Marketing", value: 200 },
  { name: "HR", value: 80 }
];

export default function DepartmentPieChart() {
  const [data, setData] = useState(startData);

  useEffect(() => {
    setTimeout(() => setData(realData), 400);
  }, []);

  return (
    <ResponsiveContainer width="100%" height="95%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          outerRadius={90}
          innerRadius={64}
          label
          stroke="white"
          // cornerRadius={12}
        >
          {realData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
