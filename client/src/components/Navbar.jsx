import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { logout, loginResponse } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">⚡</span>
        <span className="navbar-title">WatchSched</span>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/create-schedule"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Create Schedule
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/open-schedule"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Open Schedule
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Admin
          </NavLink>
        </li>
      </ul>
      <div className="navbar-user">
        {loginResponse?.user && (
          <span className="navbar-username">
            {loginResponse.user.username || `User #${loginResponse.user.id}`}
          </span>
        )}
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
