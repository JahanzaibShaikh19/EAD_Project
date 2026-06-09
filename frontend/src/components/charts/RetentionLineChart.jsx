// frontend/src/components/charts/RetentionLineChart.jsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const DEFAULT_DATA = [
  { month: 'Jan', hires: 12, resignations: 3, retention: 94 },
  { month: 'Feb', hires: 8,  resignations: 2, retention: 96 },
  { month: 'Mar', hires: 15, resignations: 5, retention: 91 },
  { month: 'Apr', hires: 10, resignations: 1, retention: 97 },
  { month: 'May', hires: 7,  resignations: 4, retention: 93 },
  { month: 'Jun', hires: 18, resignations: 2, retention: 96 },
  { month: 'Jul', hires: 11, resignations: 3, retention: 95 },
  { month: 'Aug', hires: 9,  resignations: 2, retention: 97 },
  { month: 'Sep', hires: 14, resignations: 6, retention: 90 },
  { month: 'Oct', hires: 16, resignations: 2, retention: 97 },
  { month: 'Nov', hires: 13, resignations: 3, retention: 95 },
  { month: 'Dec', hires: 20, resignations: 4, retention: 94 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
      <p className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{entry.name}:</span>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {entry.name === 'Retention Rate' ? `${entry.value}%` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RetentionLineChart({ data }) {
  const chartData = data || DEFAULT_DATA;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="count"
          orientation="left"
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          domain={[80, 100]}
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans', paddingTop: '8px' }}
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="hires"
          name="Hires"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="resignations"
          name="Resignations"
          stroke="#EF4444"
          strokeWidth={2}
          dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="retention"
          name="Retention Rate"
          stroke="#8B5CF6"
          strokeWidth={2}
          dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
