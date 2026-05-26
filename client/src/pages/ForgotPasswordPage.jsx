import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import { FiZap, FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import './LoginPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setSent(res.data.resetToken);
      toast.success('Reset token generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-root mounted" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="login-right" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-logo"><FiZap /></div>
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a reset token</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="lf-group">
                <label>Email Address</label>
                <div className="lf-input-wrap">
                  <FiMail className="lf-icon" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="lf-submit" disabled={loading}>
                {loading ? <span className="lf-spinner" /> : 'Send Reset Token'}
              </button>
            </form>
          ) : (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#059669', fontWeight: 700, marginBottom: '.75rem' }}>
                <FiCheck /> Token Generated (Dev Mode)
              </div>
              <p style={{ fontSize: '.78rem', color: '#374151', marginBottom: '.5rem' }}>Use this token to reset your password:</p>
              <code style={{ display: 'block', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '.78rem', background: '#fff', padding: '.75rem', borderRadius: 8, border: '1px solid #d1fae5', color: '#065f46' }}>
                {sent}
              </code>
              <Link 
                to={`/reset-password/${sent}`}
                style={{ 
                  display: 'block', 
                  marginTop: '1rem', 
                  textAlign: 'center', 
                  background: '#059669', 
                  color: '#fff', 
                  padding: '.6rem', 
                  borderRadius: 8, 
                  textDecoration: 'none',
                  fontSize: '.85rem',
                  fontWeight: 600
                }}
              >
                Go to Reset Page
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
              <FiArrowLeft /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
