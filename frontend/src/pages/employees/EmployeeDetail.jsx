// frontend/src/pages/employees/EmployeeDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Pencil } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Avatar from '../../components/shared/Avatar';
import StatusBadge from '../../components/shared/StatusBadge';
import AttendanceHeatmap from '../../components/charts/AttendanceHeatmap';
import PerformanceRadar from '../../components/charts/PerformanceRadar';
import { Skeleton } from '../../components/ui/skeleton';
import { useEmployee } from '../../api/employeeApi';
import { useMyAttendance } from '../../api/attendanceApi';
import { useMyPerformanceReviews } from '../../api/performanceApi';
import { useMyLeaveRequests } from '../../api/leaveApi';
import { formatDate, formatCurrency, getFullName } from '../../utils/helpers';
import { useState } from 'react';
import EmployeeForm from './EmployeeForm';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--color-primary-light)' }}
      >
        <Icon size={14} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
          {label}
        </p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const { data: empData, isLoading } = useEmployee(id);
  const employee = empData?.data;

  const { data: attData } = useMyAttendance({
    employee_id: id,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const { data: perfData } = useMyPerformanceReviews();
  const { data: leaveData } = useMyLeaveRequests();

  const attendance = attData?.data || [];
  const latestReview = perfData?.data?.[0];
  const leaveRequests = leaveData?.data || [];

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!employee) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p style={{ color: 'var(--color-text-secondary)' }}>Employee not found.</p>
          <button onClick={() => navigate('/employees')} className="mt-4 text-sm" style={{ color: 'var(--color-primary)' }}>
            ← Back to employees
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Back button + Edit */}
      <div className="page-header flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={16} /> Back to Employees
        </button>
        <button
          id="edit-employee-btn"
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          <Pencil size={14} /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="stat-card card flex flex-col items-center text-center p-6">
          <Avatar
            photoUrl={employee.photo_url}
            firstName={employee.first_name}
            lastName={employee.last_name}
            size={80}
          />
          <h2 className="font-heading font-semibold mt-4 text-lg" style={{ color: 'var(--color-text-primary)' }}>
            {getFullName(employee)}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {employee.position_title || 'No position'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {employee.dept_name || 'No department'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
            <StatusBadge type="contract" value={employee.contract_type} />
            <StatusBadge type="status" value={employee.status} />
          </div>
          <div
            className="mt-4 w-full px-4 py-2 rounded-lg text-xs font-semibold font-heading"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            {employee.employee_code}
          </div>
        </div>

        {/* Info Panel */}
        <div className="stat-card card p-6 lg:col-span-2">
          <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Employee Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoRow icon={Mail} label="Email" value={employee.email} />
            <InfoRow icon={Phone} label="Phone" value={employee.phone} />
            <InfoRow icon={Calendar} label="Hire Date" value={formatDate(employee.hire_date)} />
            <InfoRow icon={Briefcase} label="Salary" value={formatCurrency(employee.salary)} />
            <InfoRow icon={MapPin} label="Address" value={employee.address} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Attendance + Performance + Leave */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Attendance Heatmap */}
        <div className="data-card card p-6">
          <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Attendance — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <AttendanceHeatmap records={attendance} month={new Date()} />
        </div>

        {/* Performance Radar */}
        <div className="data-card card p-6">
          <h3 className="font-heading font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Latest Performance Review
          </h3>
          {latestReview ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(latestReview.review_date)} — Overall: {latestReview.rating}/5 ⭐
                </span>
              </div>
              <PerformanceRadar review={latestReview} />
            </>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
              No performance reviews yet
            </p>
          )}
        </div>
      </div>

      {/* Leave History */}
      <div className="data-card card mt-4 p-6">
        <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Leave History
        </h3>
        {leaveRequests.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
            No leave requests found
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.slice(0, 5).map((lr) => (
                <tr key={lr.id} className="table-row">
                  <td className="capitalize">{lr.leave_type}</td>
                  <td>{formatDate(lr.start_date)}</td>
                  <td>{formatDate(lr.end_date)}</td>
                  <td><StatusBadge type="leave" value={lr.status} /></td>
                  <td className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {lr.reason || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EmployeeForm
          open={showEdit}
          onClose={() => setShowEdit(false)}
          employee={employee}
        />
      )}
    </PageWrapper>
  );
}
