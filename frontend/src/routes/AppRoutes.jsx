// frontend/src/routes/AppRoutes.jsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectRole } from '../store/authSlice';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { closeMobileSidebar, selectSidebarCollapsed, selectMobileSidebarOpen } from '../store/uiSlice';

// Pages (lazy imported for better perf but kept direct for simplicity)
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import EmployeeList from '../pages/employees/EmployeeList';
import EmployeeDetail from '../pages/employees/EmployeeDetail';
import EmployeeForm from '../pages/employees/EmployeeForm';
import Departments from '../pages/departments/Departments';
import Attendance from '../pages/attendance/Attendance';
import LeaveList from '../pages/leave/LeaveList';
import Payroll from '../pages/payroll/Payroll';
import PerformanceList from '../pages/performance/PerformanceList';
import PerformanceDetail from '../pages/performance/PerformanceDetail';
import Goals from '../pages/performance/Goals';
import Announcements from '../pages/announcements/Announcements';
import MyProfile from '../pages/profile/MyProfile';
import Settings from '../pages/settings/Settings';

/** Layout wrapper for authenticated pages */
function AppLayout() {
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const mobileSidebarOpen = useSelector(selectMobileSidebarOpen);

  return (
    <div className="main-layout bg-transparent">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      {/* Main content area */}
      <div
        className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{
          marginLeft: sidebarCollapsed
            ? 'var(--sidebar-collapsed)'
            : 'var(--sidebar-width)',
        }}
      >
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

/** Redirect to /login if not authenticated */
function PrivateRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Show 403 if role doesn't match */
function RoleRoute({ allowedRoles }) {
  const role = useSelector(selectRole);
  if (!allowedRoles.includes(role)) {
    return (
      <div className="page-content flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          403 — Access Denied
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          You don't have permission to view this page.
        </p>
      </div>
    );
  }
  return <Outlet />;
}

export default function AppRoutes() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
      />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<LeaveList />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/performance" element={<PerformanceList />} />
          <Route path="/performance/:id" element={<PerformanceDetail />} />
          <Route path="/goals" element={<div className="p-4 md:p-8"><Goals /></div>} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/settings" element={<Settings />} />

          {/* HR only */}
          <Route element={<RoleRoute allowedRoles={['hr']} />}>
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/departments" element={<Departments />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
