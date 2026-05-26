import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import {
  FiZap, FiUser, FiMail, FiLock, FiPhone,
  FiMapPin, FiHash, FiEye, FiEyeOff,
  FiArrowLeft, FiArrowRight, FiCheck,
  FiShield, FiInfo, FiBriefcase, FiGrid
} from 'react-icons/fi';
import './RegisterPage.css';

/* ─── Step configs ──────────────────────────────────────────────────────── */
const CONSUMER_STEPS = [
  { id: 'account',    label: 'Account Info',      icon: '👤' },
  { id: 'personal',   label: 'Personal Details',  icon: '📋' },
  { id: 'connection', label: 'Meter Details',     icon: '⚡' },
  { id: 'otp',        label: 'OTP Verification',  icon: '🔐' },
];

const EMPLOYEE_STEPS = [
  { id: 'account',  label: 'Account Info',     icon: '👤' },
  { id: 'personal', label: 'Personal Details', icon: '📋' },
  { id: 'otp',      label: 'OTP Verification', icon: '🔐' },
];

const DEPARTMENTS = [
  'Billing & Revenue',
  'Field Operations',
  'Customer Service',
  'Technical Support',
  'Meter Management',
  'Administration',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') === 'employee' ? 'employee' : 'consumer';

  const [role]   = useState(roleParam);
  const steps    = role === 'employee' ? EMPLOYEE_STEPS : CONSUMER_STEPS;
  const isEmp    = role === 'employee';

  const [step,      setStep]      = useState(0);
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [focused,   setFocused]   = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    cnic: '', phone: '', address: '', area: '',
    meterNumber: '', connectionType: 'residential',
    department: '', employeeId: '',
    otp: '',
  });

  const set    = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const focus  = (k) => ()  => setFocused(k);
  const blur   = ()  => setFocused('');

  /* ── Validation ─────────────────────────────────────────────────────── */
  const validate = () => {
    if (step === 0) {
      if (!form.name.trim())                       { toast.error('Full name is required');                   return false; }
      if (!form.email.trim())                      { toast.error('Email is required');                       return false; }
      if (form.password.length < 6)                { toast.error('Password must be at least 6 characters'); return false; }
      if (form.password !== form.confirmPassword)  { toast.error('Passwords do not match');                  return false; }
    }
    if (step === 1) {
      if (!form.cnic.trim())                       { toast.error('CNIC is required');                        return false; }
      if (!form.phone.trim())                      { toast.error('Phone number is required');                return false; }
      if (!isEmp && !form.area.trim())             { toast.error('Area is required');                       return false; }
      if (!isEmp && !form.address.trim())          { toast.error('Address is required');                     return false; }
      if (isEmp && !form.department)               { toast.error('Department is required');                  return false; }
    }
    if (step === 2 && !isEmp) {
      if (!form.meterNumber.trim())                { toast.error('Meter number is required');                return false; }
    }
    if (isLast) {
      if (!form.otp.trim())                        { toast.error('OTP is required');                         return false; }
      if (form.otp !== '123456')                   { toast.error('Invalid OTP (use 123456 for demo)');       return false; }
    }
    return true;
  };

  const next = () => { 
    if (validate()) {
      if ((step === 2 && !isEmp) || (step === 1 && isEmp)) {
        toast.success('OTP sent to your phone/email!');
      }
      setStep(s => s + 1); 
    }
  };
  const back = () => setStep(s => s - 1);

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isEmp && !form.meterNumber.trim()) { toast.error('Meter number is required'); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        role, fullName: form.name,
        cnic: form.cnic, phone: form.phone, address: form.address, area: form.area,
        ...(role === 'consumer' && { meterNumber: form.meterNumber, connectionType: form.connectionType }),
        ...(isEmp && { department: form.department, employeeId: form.employeeId }),
      };
      const res = await authAPI.register(payload);
      if (res.data.pending) { 
        setDone(true); 
        toast.success('Application submitted! Pending admin approval.');
      }
      else { toast.success('Account created! Please sign in.'); navigate('/login'); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const isLast = step === steps.length - 1;

  /* ══════════════════════════════════════════════════════════════════════
     PENDING SCREEN
  ══════════════════════════════════════════════════════════════════════ */
  if (done) {
    return (
      <div className="rp-root">
        <div className="rp-orb rp-orb-1" />
        <div className="rp-orb rp-orb-2" />
        <div className="rp-orb rp-orb-3" />
        <div className="rp-pending-wrap">
          <div className="rp-pending-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div className="success-icon-wrap" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <FiCheck className="success-icon" style={{ fontSize: '3rem', color: '#10b981' }} />
            </div>
            <h2 className="success-title">Application Submitted!</h2>
            <p className="success-desc" style={{ marginBottom: '1.5rem', color: '#64748b' }}>
              Your employee account application has been sent to the administrator for approval.
              You can check your status by trying to <strong>Login</strong> with your credentials.
            </p>
            <div className="success-info-box" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
              <FiInfo className="info-icon" style={{ color: '#3b82f6', flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', color: '#475569' }}>You will be able to access the dashboard once an admin approves your request.</span>
            </div>
            <Link to="/login" className="rp-pending-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              Go to Login <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     MAIN REGISTER PAGE
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="rp-root">
      <div className="rp-orb rp-orb-1" />
      <div className="rp-orb rp-orb-2" />
      <div className="rp-orb rp-orb-3" />

      <div className="rp-right">
        <div className={`rp-card ${isEmp ? 'emp' : 'con'}`}>

          {/* Back link */}
          <Link to="/login" className="rp-back">
            <FiArrowLeft /> Back to Sign In
          </Link>

          {/* Card header */}
          <div className="rp-card-header">
            <div className={`rp-card-logo ${isEmp ? 'emp' : 'con'}`}>
              <FiZap />
            </div>
            <h2>Create Your Account</h2>
            <p className={`rp-card-sub ${isEmp ? 'emp' : 'con'}`}>
              {isEmp
                ? 'Requires admin approval before activation'
                : 'Get instant access after verification'}
            </p>
          </div>

          {/* Step progress */}
          <div className="rp-steps">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`rp-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  <div className={`rp-step-circle ${isEmp ? 'emp' : 'con'}`}>
                    {i < step ? <FiCheck /> : <span>{i + 1}</span>}
                  </div>
                  <div className="rp-step-label">{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`rp-step-connector ${i < step ? 'done' : ''} ${isEmp ? 'emp' : 'con'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={isLast ? handleSubmit : (e) => { e.preventDefault(); next(); }}
            noValidate
            className="rp-form"
          >
            <div className="rp-fields" key={step}>

              {/* ── STEP 0: Account Info ── */}
              {step === 0 && <>
                <div className={`rp-field ${focused === 'name' ? 'focused' : ''}`}>
                  <label>Full Name</label>
                  <div className="rp-input-wrap">
                    <FiUser className="rp-fi" />
                    <input
                      type="text" placeholder="Ali Hassan" value={form.name}
                      onChange={set('name')} onFocus={focus('name')} onBlur={blur} autoFocus
                    />
                  </div>
                </div>

                <div className={`rp-field ${focused === 'email' ? 'focused' : ''}`}>
                  <label>Email Address</label>
                  <div className="rp-input-wrap">
                    <FiMail className="rp-fi" />
                    <input
                      type="email" placeholder="ali@example.com" value={form.email}
                      onChange={set('email')} onFocus={focus('email')} onBlur={blur}
                    />
                  </div>
                </div>

                <div className={`rp-field ${focused === 'password' ? 'focused' : ''}`}>
                  <label>Password</label>
                  <div className="rp-input-wrap">
                    <FiLock className="rp-fi" />
                    <input
                      type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={form.password} onChange={set('password')}
                      onFocus={focus('password')} onBlur={blur}
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowPass(v => !v)}>
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className={`rp-field ${focused === 'confirm' ? 'focused' : ''}`}>
                  <label>Confirm Password</label>
                  <div className="rp-input-wrap">
                    <FiLock className="rp-fi" />
                    <input
                      type={showConf ? 'text' : 'password'} placeholder="Re-enter password"
                      value={form.confirmPassword} onChange={set('confirmPassword')}
                      onFocus={focus('confirm')} onBlur={blur}
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowConf(v => !v)}>
                      {showConf ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </>}

              {/* ── STEP 1: Personal Details ── */}
              {step === 1 && <>
                <div className={`rp-field ${focused === 'cnic' ? 'focused' : ''}`}>
                  <label>CNIC</label>
                  <div className="rp-input-wrap">
                    <FiHash className="rp-fi" />
                    <input
                      type="text" placeholder="XXXXX-XXXXXXX-X" value={form.cnic}
                      onChange={set('cnic')} onFocus={focus('cnic')} onBlur={blur} autoFocus
                    />
                  </div>
                </div>

                <div className={`rp-field ${focused === 'phone' ? 'focused' : ''}`}>
                  <label>Contact Number</label>
                  <div className="rp-input-wrap">
                    <FiPhone className="rp-fi" />
                    <input
                      type="text" placeholder="0300-1234567" value={form.phone}
                      onChange={set('phone')} onFocus={focus('phone')} onBlur={blur}
                    />
                  </div>
                </div>

                {isEmp ? <>
                  <div className={`rp-field ${focused === 'empId' ? 'focused' : ''}`}>
                    <label>Employee ID <span className="rp-optional">(optional)</span></label>
                    <div className="rp-input-wrap">
                      <FiBriefcase className="rp-fi" />
                      <input
                        type="text" placeholder="EMP-001" value={form.employeeId}
                        onChange={set('employeeId')} onFocus={focus('empId')} onBlur={blur}
                      />
                    </div>
                  </div>

                  <div className={`rp-field ${focused === 'dept' ? 'focused' : ''}`}>
                    <label>Department</label>
                    <div className="rp-input-wrap">
                      <FiGrid className="rp-fi" />
                      <select
                        value={form.department} onChange={set('department')}
                        onFocus={focus('dept')} onBlur={blur} className="rp-select"
                      >
                        <option value="">Select department...</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="rp-info-box emp">
                    <FiInfo />
                    <span>Your application will be reviewed by an administrator. You'll receive access once approved.</span>
                  </div>
                </> : <>
                  <div className={`rp-field ${focused === 'area' ? 'focused' : ''}`}>
                    <label>Area / Locality</label>
                    <div className="rp-input-wrap">
                      <FiMapPin className="rp-fi" />
                      <input
                        type="text" placeholder="e.g. Gulberg III, DHA Phase 5" value={form.area}
                        onChange={set('area')} onFocus={focus('area')} onBlur={blur}
                      />
                    </div>
                  </div>
                  <div className={`rp-field ${focused === 'address' ? 'focused' : ''}`}>
                    <label>Full Address</label>
                    <div className="rp-input-wrap">
                      <FiMapPin className="rp-fi" />
                      <input
                        type="text" placeholder="House #, Street, City" value={form.address}
                        onChange={set('address')} onFocus={focus('address')} onBlur={blur}
                      />
                    </div>
                  </div>
                </>}
              </>}

              {/* ── STEP 2: Verification (consumer only) ── */}
              {step === 2 && !isEmp && <>
                <div className={`rp-field ${focused === 'meter' ? 'focused' : ''}`}>
                  <label>Consumer ID / Meter Number</label>
                  <div className="rp-input-wrap">
                    <FiHash className="rp-fi" />
                    <input
                      type="text" placeholder="e.g. MTR-001" value={form.meterNumber}
                      onChange={set('meterNumber')} onFocus={focus('meter')} onBlur={blur} autoFocus
                    />
                  </div>
                </div>

                <div className={`rp-field ${focused === 'connType' ? 'focused' : ''}`}>
                  <label>Connection Type</label>
                  <div className="rp-input-wrap">
                    <FiZap className="rp-fi" />
                    <select
                      value={form.connectionType} onChange={set('connectionType')}
                      onFocus={focus('connType')} onBlur={blur} className="rp-select"
                    >
                      <option value="residential">🏠 Residential</option>
                      <option value="commercial">🏢 Commercial</option>
                      <option value="industrial">🏭 Industrial</option>
                    </select>
                  </div>
                </div>

                <div className="rp-info-box con">
                  <FiInfo />
                  <span>Your default password will be your CNIC (without dashes). You can change it after first login.</span>
                </div>
              </>}

              {/* ── STEP 3: OTP Verification ── */}
              {isLast && <>
                <div className="rp-otp-header">
                  <div className="rp-otp-icon"><FiLock /></div>
                  <h3>Verify Your Identity</h3>
                  <p>We've sent a 6-digit code to <strong>{form.phone || 'your phone'}</strong></p>
                </div>
                <div className={`rp-field ${focused === 'otp' ? 'focused' : ''}`}>
                  <label>Verification Code (OTP)</label>
                  <div className="rp-input-wrap">
                    <FiShield className="rp-icon" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={form.otp}
                      onChange={set('otp')}
                      onFocus={focus('otp')}
                      onBlur={blur}
                      maxLength={6}
                      style={{ letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}
                    />
                  </div>
                </div>
                <p className="rp-resend">
                  Didn't receive code? <button type="button">Resend OTP</button>
                </p>
              </>}
            </div>

            {/* Navigation */}
            <div className="rp-nav">
              {step > 0 && (
                <button type="button" className="rp-btn-back" onClick={back}>
                  <FiArrowLeft /> Back
                </button>
              )}
              <button
                type="submit"
                className={`rp-btn-next ${isEmp ? 'emp' : 'con'}`}
                disabled={loading}
              >
                {loading
                  ? <span className="rp-spinner" />
                  : isLast
                    ? <>{isEmp ? 'Submit Application' : 'Create Account'} <FiCheck /></>
                    : <>Continue <FiArrowRight /></>
                }
              </button>
            </div>
          </form>

          {/* Already have an account */}
          <div className="rp-signin-link">
            Already have an account?{' '}
            <Link to="/login" className={`rp-signin-anchor ${isEmp ? 'emp' : 'con'}`}>
              Sign In
            </Link>
          </div>

          {/* Bottom note */}
          <div className={`rp-bottom-note ${isEmp ? 'emp' : 'con'}`}>
            {isEmp
              ? <><FiShield /> Employee accounts require administrator approval before access is granted.</>
              : <><FiCheck /> Account activated after email verification. Instant access to your dashboard.</>
            }
          </div>

        </div>
      </div>
    </div>
  );
}