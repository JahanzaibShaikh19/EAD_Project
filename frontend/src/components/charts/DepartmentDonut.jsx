// frontend/src/components/charts/DepartmentDonut.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#1A6B5A', '#2D9E80', '#4DB6A2', '#7DD4C6', '#A8E6DC', '#D0F4EE'];

const DEFAULT_DATA = [
  { name: 'Engineering', count: 42, percentage: 41 },
  { name: 'Marketing',   count: 23, percentage: 22.5 },
  { name: 'Finance',     count: 18, percentage: 17.6 },
  { name: 'IT',          count: 12, percentage: 11.8 },
  { name: 'HR',          count: 7,  percentage: 6.9 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div
      className="rounded-xl p-3 shadow-lg"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '12px',
      }}
    >
      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{data.name}</p>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        {data.count} employees ({data.percentage}%)
      </p>
    </div>
  );
};

export default function DepartmentDonut({ data }) {
  let chartData = DEFAULT_DATA;
  if (data && data.length > 0) {
    chartData = data.map(d => ({
      name: d.name,
      count: d.count !== undefined ? d.count : (d.value || 0),
    }));
  }

  const total = chartData.reduce((s, d) => s + d.count, 0);

  // Calculate percentage dynamically
  chartData = chartData.map(d => ({
    ...d,
    percentage: total > 0 ? ((d.count / total) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      {/* Donut chart */}
      <div className="relative" style={{ width: 180, height: 180, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="font-heading"
            style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}
          >
            {total}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3 min-w-0">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: COLORS[idx % COLORS.length] }}
            />
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                {item.name}
              </span>
              <div className="flex items-center gap-2 text-sm font-bold flex-shrink-0">
                <span style={{ color: 'var(--color-text-primary)' }}>{item.percentage}%</span>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>({item.count})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
