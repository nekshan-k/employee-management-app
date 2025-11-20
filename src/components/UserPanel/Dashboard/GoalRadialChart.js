import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const realValue = 85;
const COLORS = ["#f43f5e", "#fde047", "#f59e42", "#10b981"];

function getColor(val) {
  if (val <= 25) return COLORS[0];
  if (val <= 50) return COLORS[1];
  if (val <= 75) return COLORS[2];
  return COLORS[3];
}

function getEndAngle(percent) {
  return 90 - (percent / 100) * 360;
}

export default function GoalRadialChart() {
  const [percent, setPercent] = useState(0);
  const [color, setColor] = useState(getColor(0));

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      if (p >= realValue) {
        setPercent(realValue);
        setColor(getColor(realValue));
        clearInterval(interval);
      } else {
        setPercent(p);
        setColor(getColor(p));
      }
    }, 12);
    return () => clearInterval(interval);
  }, []);

  const ringSize = 260;
  const chartData = [{ name: "Goal", uv: percent, fill: color }];

  return (
    <div className="flex flex-col items-center h-full w-full justify-center relative">
      <ResponsiveContainer width={ringSize} height={ringSize}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="74%"
          outerRadius="97%"
          barSize={21}
          data={chartData}
          startAngle={90}
          endAngle={getEndAngle(percent)}
        >
          <RadialBar
            minAngle={15}
            clockWise
            background
            dataKey="uv"
            cornerRadius={14}
            fill={color}
            isAnimationActive
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          top: "50%",
          left: "50%",
          width: ringSize * 0.67,
          height: ringSize * 0.67,
          transform: "translate(-50%,-50%)",
          pointerEvents: "none"
        }}
      >
        <span className="block text-4xl font-extrabold" style={{ color }}>{percent}%</span>
        <div className="mt-1 text-base font-medium text-gray-700">Project Complete</div>
      </div>
    </div>
  );
}
