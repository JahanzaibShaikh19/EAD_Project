// frontend/src/pages/performance/PerformanceDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Avatar from '../../components/shared/Avatar';
import PerformanceRadar from '../../components/charts/PerformanceRadar';
import { Skeleton } from '../../components/ui/skeleton';
import { usePerformanceReview } from '../../api/performanceApi';
import { formatDate, getFullName } from '../../utils/helpers';
import { PERFORMANCE_METRIC_LABELS } from '../../utils/constants';
import Goals from './Goals';

function MetricBar({ label, score }) {
  const pct = Math.round((score / 10) * 100);
  const getColor = () => {
    if (pct >= 80) return 'var(--color-success)';
    if (pct >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: getColor() }}>
          {score}/10
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: getColor() }}
        />
      </div>
    </div>
  );
}

export default function PerformanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = usePerformanceReview(id);
  const review = data?.data;

  if (isLoading) {
    return (
      <PageWrapper>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  if (!review) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p style={{ color: 'var(--color-text-secondary)' }}>Review not found.</p>
          <button onClick={() => navigate('/performance')} className="mt-4 text-sm" style={{ color: 'var(--color-primary)' }}>
            ← Back to reviews
          </button>
        </div>
      </PageWrapper>
    );
  }

  const metrics = [
    'quality_of_work', 'collaboration', 'initiative',
    'punctuality', 'communication', 'problem_solving',
  ];

  return (
    <PageWrapper>
      {/* Back button */}
      <div className="page-header flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/performance')}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={16} /> Back to Reviews
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Employee profile */}
        <div className="stat-card card p-6 flex flex-col items-center text-center">
          <Avatar
            photoUrl={review.photo_url}
            firstName={review.first_name}
            lastName={review.last_name}
            size={72}
          />
          <h2 className="font-heading font-semibold mt-4 text-lg" style={{ color: 'var(--color-text-primary)' }}>
            {review.first_name} {review.last_name}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {review.position_title || 'No position'} · {review.dept_name}
          </p>
          <div className="mt-4 text-center">
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Overall Rating
            </p>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  style={{
                    fill: i < review.rating ? '#F59E0B' : 'none',
                    stroke: i < review.rating ? '#F59E0B' : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-text-primary)' }}>
              {review.rating}/5 stars
            </p>
          </div>
          <div className="mt-4 w-full space-y-1 text-left">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-text-secondary)' }}>Review Date</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{formatDate(review.review_date)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-text-secondary)' }}>Reviewer</span>
              <span style={{ color: 'var(--color-text-primary)' }}>
                {review.reviewer_name || 'HR Manager'}
              </span>
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="stat-card card p-6 lg:col-span-2">
          <h3 className="font-heading font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Performance Overview
          </h3>
          <PerformanceRadar review={review} />
        </div>
      </div>

      {/* Metric bars + Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="data-card card p-6">
          <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Metric Breakdown
          </h3>
          <div className="space-y-4">
            {metrics.map((key) => (
              <MetricBar
                key={key}
                label={PERFORMANCE_METRIC_LABELS[key]}
                score={review[key] || 0}
              />
            ))}
          </div>
        </div>

        <div className="data-card card p-6">
          <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Reviewer Comments
          </h3>
          {review.comments ? (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {review.comments}
            </p>
          ) : (
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-tertiary)' }}>
              No comments provided.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 data-card card p-6">
        <Goals employeeId={review.employee_id} />
      </div>
    </PageWrapper>
  );
}
