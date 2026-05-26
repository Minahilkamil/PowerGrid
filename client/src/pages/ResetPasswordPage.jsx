import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import { FiZap, FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft } from 'react-icons/fi';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password });
      toast.success('Password reset successfully!');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root mounted" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="login-right" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-logo"><FiZap /></div>
            <h2>Reset Password</h2>
            <p>Enter your new password below</p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 64, height: 64, background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
                <FiCheck style={{margin: 'auto'}} />
              </div>
              <h3 style={{ color: '#111827', marginBottom: '.5rem' }}>Success!</h3>
              <p style={{ color: '#6b7280', fontSize: '.9rem' }}>Your password has been reset. Redirecting to login...</p>
              <Link to="/login" className="lf-submit" style={{ marginTop: '1.5rem', display: 'block', textDecoration: 'none', textAlign: 'center', lineHeight: '2.5rem' }}>
                Go to Login Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="lf-group">
                <label>New Password</label>
                <div className="lf-input-wrap">
                  <FiLock className="lf-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="lf-show-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="lf-group">
                <label>Confirm New Password</label>
                <div className="lf-input-wrap">
                  <FiLock className="lf-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="lf-submit" disabled={loading}>
                {loading ? <span className="lf-spinner" /> : 'Reset Password'}
              </button>
            </form>
          )}

          {!success && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                <FiArrowLeft /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
