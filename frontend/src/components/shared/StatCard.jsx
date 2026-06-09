// frontend/src/components/shared/StatCard.jsx
import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

/**
 * KPI Stat Card with GSAP counter animation
 * @param {string} title - Card label
 * @param {number|string} value - The main KPI value
 * @param {string} [suffix] - e.g. "%" after value
 * @param {string} [prefix] - e.g. "$" before value
 * @param {number} [change] - percentage change (positive = up, negative = down)
 * @param {string} [changeLabel] - e.g. "from last week"
 * @param {React.ElementType} [icon] - Lucide icon component
 * @param {string} [iconColor] - icon background color
 * @param {boolean} [animate] - whether to run counter animation (default true)
 */
export default function StatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  change,
  changeLabel = 'from last week',
  icon: Icon,
  iconColor,
  animate = true,
}) {
  const counterRef = useRef(null);
  const numericValue = parseFloat(String(value).replace(/,/g, '')) || 0;

  useEffect(() => {
    if (!animate || !counterRef.current || isNaN(numericValue)) return;

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: numericValue,
      duration: 1.4,
      ease: 'power2.out',
      snap: { val: numericValue % 1 === 0 ? 1 : 0.01 },
      onUpdate() {
        if (counterRef.current) {
          const rounded = numericValue % 1 === 0
            ? Math.round(obj.val).toLocaleString()
            : obj.val.toFixed(1);
          counterRef.current.textContent = `${prefix}${rounded}${suffix}`;
        }
      },
    });

    return () => tween.kill();
  }, [numericValue, animate, prefix, suffix]);

  const isPositive = change > 0;
  const isNegative = change < 0;

  // Generate fake sparkline data based on trend
  const sparklineData = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      value: isPositive ? 10 + i * Math.random() * 5 : 50 - i * Math.random() * 5
    }));
  }, [isPositive]);

  return (
    <div
      className="glass-card stat-card card-hover"
      style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconColor || 'var(--color-primary-light)' }}
          >
            <Icon size={18} style={{ color: iconColor ? 'white' : 'var(--color-primary)' }} />
          </div>
        )}
        <p
          className="text-sm font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'DM Sans, sans-serif' }}
        >
          {title}
        </p>
      </div>

      <div className="flex items-end justify-between mt-2">
        <div
          ref={counterRef}
          className="stat-number"
          style={{ color: 'var(--color-text-primary)', fontSize: '32px' }}
        >
          {animate
            ? `${prefix}0${suffix}`
            : `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`
          }
        </div>
        <div style={{ width: '60px', height: '30px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke={isPositive ? 'var(--color-success)' : 'var(--color-danger)'} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Change indicator */}
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Delta trend</span>
          <div
            className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ color: isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}
          >
            {isPositive ? '+' : ''}{change}%
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {changeLabel}
          </span>
        </div>
      )}
    </div>
  );
}
