import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiZap,
  FiArrowRight, FiShield, FiChevronRight
} from 'react-icons/fi';
import './LoginPage.css';

const FEATURES = [
  { icon: '⚡', label: 'Real-time Meter Monitoring',  desc: 'Live readings & alerts' },
  { icon: '💳', label: 'Online Bill Payments',        desc: 'Multiple payment methods' },
  { icon: '📊', label: 'Usage Analytics',             desc: 'Consumption trends & reports' },
  { icon: '🔔', label: 'Smart Notifications',         desc: 'Due date & payment alerts' },
  { icon: '📄', label: 'Automated Billing',           desc: 'Slab-rate bill generation' },
  { icon: '🛠',  label: 'Complaint Management',       desc: 'Track & resolve issues' },
];

const STATS = [
  { value: '50K+', label: 'Consumers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '₨2M+', label: 'Processed' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'consumer') {
        setShowOtp(true);
        setTempUser(user);
        toast.success('Login successful! Please verify OTP.');
      } else {
        toast.success(`Welcome back, ${user.name}! 👋`);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otp === '123456') {
      toast.success(`Welcome back, ${tempUser.name}! 👋`);
      navigate('/consumer/dashboard');
    } else {
      toast.error('Invalid OTP. Use 123456 for demo.');
    }
  };

  return (
    <div className={`login-root ${mounted ? 'mounted' : ''}`}>
      {/* ── Animated background orbs ── */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="login-left">
        {/* Brand */}
        <div className="login-brand">
          <div className="brand-icon-wrap">
            <FiZap />
          </div>
          <div>
            <div className="brand-name">PowerGrid</div>
            <div className="brand-tagline">Enterprise Edition</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="login-hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted by 500+ utilities
          </div>
          <h1 className="hero-title">
            Smart Electricity<br />
            <span className="hero-title-accent">Management</span>
          </h1>
          <p className="hero-subtitle">
            Manage consumers, billing, meter readings, and analytics
            efficiently — all from one powerful dashboard.
          </p>
        </div>

        {/* Stats row */}
        <div className="stats-row">
          {STATS.map((s) => (
            <div key={s.label} className="stat-pill">
              <div className="stat-pill-value">{s.value}</div>
              <div className="stat-pill-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.label} className="feature-card">
              <div className="feature-card-icon">{f.icon}</div>
              <div>
                <div className="feature-card-label">{f.label}</div>
                <div className="feature-card-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="trust-bar">
          <FiShield />
          <span>256-bit SSL encrypted · ISO 27001 compliant · GDPR ready</span>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div className="login-right">
        <div className="login-card">
          {/* Card header */}
          <div className="login-card-header">
            <div className="login-card-logo">
              <FiZap />
            </div>
            <h2>{showOtp ? 'Verification' : 'Sign In'}</h2>
            <p>{showOtp ? 'Enter the 6-digit code sent to your phone' : 'Access your PowerGrid dashboard'}</p>
          </div>

          {!showOtp ? (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="login-form">
                {/* Email */}
                <div className={`lf-group ${focused === 'email' ? 'focused' : ''} ${form.email ? 'has-value' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <div className="lf-input-wrap">
                    <FiMail className="lf-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={`lf-group ${focused === 'password' ? 'focused' : ''} ${form.password ? 'has-value' : ''}`}>
                  <div className="lf-label-row">
                    <label htmlFor="password">Password</label>
                    <Link to="/forgot-password" className="lf-forgot">Forgot password?</Link>
                  </div>
                  <div className="lf-input-wrap">
                    <FiLock className="lf-icon" />
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused('')}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="lf-eye"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="lf-submit" disabled={loading}>
                  {loading ? (
                    <span className="lf-spinner" />
                  ) : (
                    <>Sign In <FiArrowRight /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="lf-divider">
                <span>New to PowerGrid?</span>
              </div>

              {/* Registration cards */}
              <div className="reg-cards">
                {/* Consumer */}
                <Link to="/register?role=consumer" className="reg-card reg-card--consumer">
                  <div className="reg-card-icon">👤</div>
                  <div className="reg-card-body">
                    <div className="reg-card-title">Consumer Account</div>
                    <div className="reg-card-desc">
                      Register to manage electricity usage, bills, and payments
                    </div>
                  </div>
                  <FiChevronRight className="reg-card-arrow" />
                </Link>

                {/* Employee */}
                <Link to="/register?role=employee" className="reg-card reg-card--employee">
                  <div className="reg-card-icon">👷</div>
                  <div className="reg-card-body">
                    <div className="reg-card-title">Employee Portal</div>
                    <div className="reg-card-desc">
                      Apply for staff access (requires admin approval)
                    </div>
                  </div>
                  <FiChevronRight className="reg-card-arrow" />
                </Link>
              </div>
            </>
          ) : (
            <form onSubmit={handleOtpVerify} className="login-form">
              <div className={`lf-group ${focused === 'otp' ? 'focused' : ''} ${otp ? 'has-value' : ''}`}>
                <label>Two-Factor Authentication</label>
                <div className="lf-input-wrap">
                  <FiShield className="lf-icon" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onFocus={() => setFocused('otp')}
                    onBlur={() => setFocused('')}
                    maxLength={6}
                    style={{ letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="lf-submit">
                Verify & Continue <FiArrowRight />
              </button>
              <button type="button" className="lf-forgot" style={{ width: '100%', marginTop: '1rem', textAlign: 'center' }} onClick={() => setShowOtp(false)}>
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
