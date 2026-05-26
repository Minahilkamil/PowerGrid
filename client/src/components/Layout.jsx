import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FiHome, FiUsers, FiActivity, FiFileText, FiCreditCard,
  FiUser, FiLogOut, FiMenu, FiX, FiZap, FiChevronRight,
  FiBriefcase, FiMessageSquare, FiClock, FiShield,
  FiPieChart, FiBell, FiLock
} from 'react-icons/fi';
import './Layout.css';

const adminNav = [
  { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { to: '/admin/consumers', icon: <FiUsers />, label: 'Consumers' },
  { to: '/admin/employees', icon: <FiBriefcase />, label: 'Employees' },
  { to: '/admin/meter-readings', icon: <FiActivity />, label: 'Meter Readings' },
  { to: '/admin/bills', icon: <FiFileText />, label: 'Billing' },
  { to: '/admin/tariffs', icon: <FiZap />, label: 'Tariff Rates' },
  { to: '/admin/payments', icon: <FiCreditCard />, label: 'Payments' },
  { to: '/admin/complaints', icon: <FiMessageSquare />, label: 'Complaints' },
  { to: '/admin/load-shedding', icon: <FiClock />, label: 'Load Shedding' },
  { to: '/admin/theft-detection', icon: <FiShield />, label: 'Theft Detection' },
  { to: '/admin/reports', icon: <FiPieChart />, label: 'Reports' },
  { to: '/admin/notifications', icon: <FiBell />, label: 'Notifications' },
  { to: '/admin/security', icon: <FiLock />, label: 'Security' },
];

const consumerNav = [
  { to: '/consumer/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { to: '/consumer/bills', icon: <FiFileText />, label: 'My Bills' },
  { to: '/consumer/payments', icon: <FiCreditCard />, label: 'Payments' },
  { to: '/consumer/analytics', icon: <FiActivity />, label: 'Usage Analytics' },
  { to: '/consumer/meter', icon: <FiZap />, label: 'Meter Info' },
  { to: '/consumer/complaints', icon: <FiMessageSquare />, label: 'Complaints' },
  { to: '/consumer/outages', icon: <FiClock />, label: 'Load Shedding' },
  { to: '/consumer/services', icon: <FiBriefcase />, label: 'Services' },
  { to: '/consumer/notifications', icon: <FiBell />, label: 'Notifications' },
  { to: '/consumer/support', icon: <FiShield />, label: 'Support' },
  { to: '/consumer/profile', icon: <FiUser />, label: 'Profile' },
];

const employeeNav = [
  { to: '/employee/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { to: '/employee/tasks', icon: <FiBriefcase />, label: 'My Tasks' },
  { to: '/employee/attendance', icon: <FiClock />, label: 'Attendance' },
  { to: '/employee/meter-readings', icon: <FiActivity />, label: 'Meter Readings' },
  { to: '/employee/complaints', icon: <FiMessageSquare />, label: 'Complaints' },
  { to: '/employee/field-service', icon: <FiShield />, label: 'Field Service' },
  { to: '/employee/maintenance', icon: <FiActivity />, label: 'Maintenance' },
  { to: '/employee/inventory', icon: <FiPieChart />, label: 'Inventory' },
  { to: '/employee/performance', icon: <FiZap />, label: 'Performance' },
  { to: '/employee/load-shedding', icon: <FiClock />, label: 'Outages' },
  { to: '/employee/notifications', icon: <FiBell />, label: 'Notifications' },
  { to: '/employee/reports', icon: <FiFileText />, label: 'My Reports' },
  { to: '/employee/profile', icon: <FiUser />, label: 'My Profile' },
];

function getPageTitle(pathname) {
  const map = {
    '/admin/dashboard': 'Dashboard',
    '/admin/consumers': 'Consumers',
    '/admin/employees': 'Employees',
    '/admin/meter-readings': 'Meter Readings',
    '/admin/bills': 'Billing',
    '/admin/tariffs': 'Tariff Rates',
    '/admin/payments': 'Payments',
    '/admin/complaints': 'Complaints',
    '/admin/load-shedding': 'Load Shedding',
    '/admin/theft-detection': 'Theft Detection',
    '/admin/reports': 'Reports',
    '/admin/notifications': 'Notifications',
    '/admin/security': 'Security',
    '/consumer/dashboard': 'Dashboard',
    '/consumer/bills': 'My Bills',
    '/consumer/payments': 'Payments',
    '/consumer/analytics': 'Usage Analytics',
    '/consumer/meter': 'Meter Info',
    '/consumer/complaints': 'Complaints',
    '/consumer/outages': 'Load Shedding',
    '/consumer/services': 'Services',
    '/consumer/notifications': 'Notifications',
    '/consumer/support': 'Support',
    '/consumer/profile': 'Profile',
    '/employee/dashboard': 'Dashboard',
    '/employee/tasks': 'My Tasks',
    '/employee/attendance': 'Attendance',
    '/employee/meter-readings': 'Meter Readings',
    '/employee/complaints': 'Complaints',
    '/employee/field-service': 'Field Service',
    '/employee/maintenance': 'Maintenance',
    '/employee/inventory': 'Inventory',
    '/employee/performance': 'Performance',
    '/employee/load-shedding': 'Outages',
    '/employee/notifications': 'Notifications',
    '/employee/reports': 'My Reports',
    '/employee/profile': 'My Profile',
  };
  for (const [key, val] of Object.entries(map)) {
    if (pathname.startsWith(key)) return val;
  }
  return 'PowerGrid';
}

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const nav = role === 'admin' ? adminNav : role === 'employee' ? employeeNav : consumerNav;
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo"><FiZap /></div>
          <div className="brand-text">
            <div className="brand-name">PowerGrid</div>
            <div className="brand-sub">Electricity Mgmt</div>
          </div>
          <button className="sidebar-close" onClick={() => setOpen(false)}>
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-label">
              {role === 'admin' ? 'Management' : 'My Account'}
            </div>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info-text">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* ── Main ── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}>
            <FiMenu />
          </button>

          <div className="topbar-breadcrumb">
            <span>PowerGrid</span>
            <FiChevronRight style={{ fontSize: '.8rem' }} />
            <strong>{pageTitle}</strong>
          </div>

          <div className="topbar-right">
            <span className="role-badge">{user?.role}</span>
            <div className="topbar-user">
              <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span className="topbar-name">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
