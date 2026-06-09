// frontend/src/components/charts/PerformanceRadar.jsx
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { PERFORMANCE_METRIC_LABELS } from '../../utils/constants';

const CustomTooltip = ({ active, payload }) => {
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
      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {payload[0]?.payload?.metric}
      </p>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Score: <strong style={{ color: 'var(--color-primary)' }}>{payload[0]?.value}/10</strong>
      </p>
    </div>
  );
};

/**
 * Performance radar chart showing 6 metrics
 * @param {Object} review - performance review object with metric scores
 */
export default function PerformanceRadar({ review }) {
  const metrics = [
    'quality_of_work',
    'collaboration',
    'initiative',
    'punctuality',
    'communication',
    'problem_solving',
  ];

  const data = metrics.map((key) => ({
    metric: PERFORMANCE_METRIC_LABELS[key] || key,
    score: review?.[key] ?? 0,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{
            fontSize: 11,
            fill: 'var(--color-text-secondary)',
            fontFamily: 'DM Sans',
          }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 10]}
          tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)' }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="var(--color-primary)"
          fill="var(--color-primary)"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--color-primary)' }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
