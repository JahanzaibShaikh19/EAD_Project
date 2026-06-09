// frontend/src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Bell, Search, Share2, ChevronRight, Menu, X, Sun, Moon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toggleMobileSidebar } from '../../store/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../api/notificationApi';
import { getInitials, getFullName } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../api/axiosConfig';

// Map route paths to breadcrumb labels
const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/attendance': 'Attendance',
  '/leave': 'Leave',
  '/payroll': 'Payroll',
  '/performance': 'Performance',
  '/announcements': 'Announcements',
  '/settings': 'Settings',
};

function buildBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'HRFlow', path: '/dashboard' }];

  let current = '';
  for (const part of parts) {
    current += `/${part}`;
    const label = ROUTE_LABELS[current] || (part.length === 36 ? 'Detail' : part.charAt(0).toUpperCase() + part.slice(1));
    crumbs.push({ label, path: current });
  }
  return crumbs;
}

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const { theme, toggleTheme } = useTheme();

  const { data: notificationsData } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const breadcrumbs = buildBreadcrumbs(location.pathname);

  // Search logic
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearch || debouncedSearch.trim() === '') {
        setSearchResults(null);
        return;
      }
      setIsSearching(true);
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get(`/employees?search=${debouncedSearch}`),
          api.get(`/departments?search=${debouncedSearch}`)
        ]);
        setSearchResults({
          employees: empRes.data?.data?.slice(0, 5) || [],
          departments: deptRes.data?.data?.slice(0, 5) || [],
        });
      } catch (err) {
        console.error('Search failed', err);
        setSearchResults({ employees: [], departments: [] });
      } finally {
        setIsSearching(false);
      }
    }
    performSearch();
  }, [debouncedSearch]);

  const userInitials = user
    ? getInitials(user.first_name || user.email?.charAt(0), user.last_name || '')
    : '??';
  const userFullName = user
    ? (user.first_name ? getFullName(user) : user.email)
    : 'User';

  return (
    <header className="top-navbar gap-4">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => dispatch(toggleMobileSidebar())}
      >
        <Menu size={20} style={{ color: 'var(--color-text-secondary)' }} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.path} className="flex items-center gap-1.5">
            {idx > 0 && (
              <ChevronRight size={12} style={{ color: 'var(--color-text-tertiary)' }} />
            )}
            <Link
              to={crumb.path}
              className="text-sm transition-colors hover:text-gray-900"
              style={{
                color: idx === breadcrumbs.length - 1
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-tertiary)',
                fontWeight: idx === breadcrumbs.length - 1 ? 500 : 400,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </div>

      {/* Search — center */}
      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-tertiary)' }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search anything... (⌘K)"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none transition-all"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(26,107,90,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
              setTimeout(() => setSearchValue(''), 200); // clear on blur after click
            }}
          />

          {/* Search Dropdown */}
          {(searchValue.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg overflow-hidden z-50" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              {isSearching ? (
                <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>Searching...</div>
              ) : searchResults ? (
                <div className="py-2">
                  {searchResults.employees.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Employees</div>
                      {searchResults.employees.map(emp => (
                        <div key={emp.id} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2" onClick={() => { navigate(`/employees/${emp.id}`); setSearchValue(''); }}>
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">{getInitials(emp.first_name, emp.last_name)}</div>
                          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{emp.first_name} {emp.last_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.departments.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Departments</div>
                      {searchResults.departments.map(dept => (
                        <div key={dept.id} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm" style={{ color: 'var(--color-text-primary)' }} onClick={() => { navigate(`/departments`); setSearchValue(''); }}>
                          {dept.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.employees.length === 0 && searchResults.departments.length === 0 && (
                    <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>No results found</div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex"
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--color-text-secondary)' }} /> : <Moon size={18} style={{ color: 'var(--color-text-secondary)' }} />}
        </button>

        {/* Share */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden md:flex">
          <Share2 size={17} style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative cursor-pointer" role="button" tabIndex={0}>
              <Bell size={17} style={{ color: 'var(--color-text-secondary)' }} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--color-danger)' }}></span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead()} className="text-xs" style={{ color: 'var(--color-primary)' }}>
                  Mark all as read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No notifications</div>
            ) : (
              notifications.map(notif => (
                <DropdownMenuItem
                  key={notif.id}
                  className={`flex flex-col items-start p-3 border-b cursor-pointer ${!notif.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  style={{ borderColor: 'var(--color-border)' }}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (!notif.is_read) markRead(notif.id);
                    if (notif.link) navigate(notif.link);
                  }}
                >
                  <div className="flex justify-between w-full mb-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{notif.title}</span>
                    {!notif.is_read && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }}></span>}
                  </div>
                  <span className="text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{notif.message}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

          {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" role="button" tabIndex={0}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                {userInitials}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{userFullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={logout}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
