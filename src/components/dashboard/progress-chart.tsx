'use client';

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';

interface ProgressChartProps {
  data: Array<{
    courseTitle: string;
    percentComplete: number;
  }>;
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.map((d, i) => ({
    name: d.courseTitle,
    value: d.percentComplete,
    fill: i === 0 ? '#4F7BF7' : i === 1 ? '#6B91FF' : '#3A63D8',
  }));

  return (
    <div className="rounded-xl bg-black-900 border border-white/10 p-6">
      <h2 className="text-lg font-heading font-semibold mb-4">Course Progress</h2>
      <div className="flex items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="100%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: '#262626' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-sm text-white/50 flex-1 truncate">{item.name}</span>
              <span className="text-sm font-medium text-accent">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
