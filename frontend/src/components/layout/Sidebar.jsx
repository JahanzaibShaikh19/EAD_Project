// frontend/src/components/layout/Sidebar.jsx
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, CalendarOff,
  Wallet, TrendingUp, Megaphone, Settings, ChevronLeft, ChevronRight,
  Leaf, LogOut, User, Target,
} from 'lucide-react';
import { toggleSidebar, selectSidebarCollapsed } from '../../store/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS_HR, NAV_ITEMS_EMPLOYEE } from '../../utils/constants';
import { getInitials, getFullName } from '../../utils/helpers';

const ICON_MAP = {
  LayoutDashboard, Users, Building2, CalendarCheck,
  CalendarOff, Wallet, TrendingUp, Megaphone, Settings, Target,
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector(selectSidebarCollapsed);
  const location = useLocation();
  const { user, isHR, logout } = useAuth();
  const navRef = useRef(null);

  const navItems = isHR ? NAV_ITEMS_HR : NAV_ITEMS_EMPLOYEE;

  // Entrance animation on first mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sidebar-logo', { x: -20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, []);

  const userInitials = user
    ? getInitials(user.first_name || user.email?.charAt(0), user.last_name || '')
    : '??';
  const userFullName = user
    ? (user.first_name ? getFullName(user) : user.email)
    : 'User';

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
    >
      <div className="flex flex-col h-full w-full relative" style={{ overflowX: 'hidden' }}>
      {/* Logo */}
      <div className="sidebar-logo flex items-center gap-3 px-6 py-6"
        style={{ minHeight: '64px' }}>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-primary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-xl tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}>
            HRFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto" ref={navRef}>
        <ul className="space-y-1 relative">
          {navItems.map((item, idx) => {
            const Icon = ICON_MAP[item.icon];
            const isActive = location.pathname === item.path
              || location.pathname.startsWith(item.path + '/');

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  style={isActive ? {
                    background: 'var(--color-primary)',
                    color: 'var(--color-text-on-primary)',
                  } : {}}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      className="flex-shrink-0"
                      style={{ color: isActive ? 'white' : 'var(--color-text-secondary)' }}
                    />
                  )}
                  {!collapsed && (
                    <span style={{ color: isActive ? 'white' : 'inherit' }}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom — Settings + User */}
      <div className="p-4 mt-auto">
        {/* User info */}
        <div className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white shadow-sm"
            style={{ background: 'var(--color-primary)' }}
          >
            {user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" /> : userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 w-full text-center mb-1">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                {user?.email}
              </p>
              <p className="text-xs truncate font-medium mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {userFullName}
              </p>
              <p className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                {user?.role === 'hr' ? 'HR' : 'Employee'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="w-full py-2 mt-1 rounded-lg font-semibold text-sm transition-colors hover:bg-gray-50 active:scale-95"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      </div>

      {/* Collapse toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3.5 top-8 w-7 h-7 rounded-full border flex items-center justify-center shadow-md hover:shadow-lg transition-all z-[60] hover:scale-105"
        style={{ 
          borderColor: 'var(--color-border)', 
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer'
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={16} strokeWidth={2.5} />
          : <ChevronLeft size={16} strokeWidth={2.5} />
        }
      </button>
    </aside>
  );
}
