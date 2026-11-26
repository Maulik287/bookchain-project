import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  User, 
  Mail, 
  GraduationCap, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Send,
  ExternalLink 
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  demoUsers,
  onQuickSwitch
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loginStep, setLoginStep] = useState(1);
  const [regStep, setRegStep] = useState(1);

  // Admin Login state (No USN)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Login form state: Name (optional), Email (No USN), DOB, Captcha
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginDob, setLoginDob] = useState('');

  // Login Step 2: Email & OTP
  const [step2Email, setStep2Email] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSession, setOtpSession] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsn, setRegUsn] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('4th Sem');

  // Register Step 2 state: OTP verification
  const [regOtpSession, setRegOtpSession] = useState(null);
  const [regOtpInput, setRegOtpInput] = useState('');

  // Captcha state
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Fetch fresh CAPTCHA
  const fetchCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      const res = await fetch('/api/auth/captcha');
      const data = await res.json();
      if (data.success) {
        setCaptchaData(data);
        setCaptchaInput('');
      }
    } catch (err) {
      console.error('Failed to load CAPTCHA:', err);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
      setError(null);
      setResendNotice('');
      setLoginStep(1);
      setRegStep(1);
      setOtpSent(false);
      setOtpInput('');
      setRegOtpInput('');
    }
  }, [isOpen, isRegister]);

  if (!isOpen) return null;

  // Handle Admin Panel Login (No USN required)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendNotice('');

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Admin login failed');
      }
      localStorage.setItem('token', data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 1 Login (No USN required)
  const handleStep1Login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendNotice('');

    if (!captchaInput.trim()) {
      setError('Please enter the security CAPTCHA characters shown.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: loginName.trim() || undefined,
          email: loginEmail.trim(),
          dob: loginDob.trim(),
          captchaId: captchaData?.captchaId,
          captchaInput: captchaInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      setLoginStep(2);
      setStep2Email(data.suggestedEmail || loginEmail.trim().toLowerCase());
      setOtpSent(false);
      setOtpInput('');
    } catch (err) {
      setError(err.message);
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP to typed email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!step2Email.trim()) {
      setError('Please type your college email address.');
      return;
    }

    if (!step2Email.trim().toLowerCase().endsWith('@msrit.edu')) {
      setError('College email must end with @msrit.edu (e.g. 1ms24ci070@msrit.edu).');
      return;
    }

    try {
      setSendingOtp(true);
      setError(null);
      setResendNotice('');

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: step2Email.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch OTP');
      }

      setOtpSession(data);
      setOtpSent(true);
      setOtpInput(''); // Must type code received on email
      setResendCooldown(30);
      setResendNotice(`OTP dispatched to ${data.email}! Check your email.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Step 2 OTP verification
  const handleStep2VerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!otpInput.trim()) {
      setError('Please enter the 6-digit OTP code received on your @msrit.edu email.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: step2Email.trim(),
          otp: otpInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }

      localStorage.setItem('token', data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Registration Step 1: Validate details (No USN required) & send OTP to @msrit.edu email
  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!captchaInput.trim()) {
      setError('Please enter the security CAPTCHA characters shown.');
      setLoading(false);
      return;
    }

    const finalEmail = regEmail.trim().toLowerCase();
    if (!finalEmail || !finalEmail.endsWith('@msrit.edu')) {
      setError('Registration requires an official college email ending with @msrit.edu (e.g. student@msrit.edu).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: finalEmail,
          dob: regDob,
          department,
          semester,
          captchaId: captchaData?.captchaId,
          captchaInput: captchaInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration step 1 failed');
      }

      setRegOtpSession(data);
      setRegStep(2);
      setRegOtpInput('');
      setResendCooldown(30);
      setResendNotice(`OTP sent to ${data.email}! Check your email inbox.`);
    } catch (err) {
      setError(err.message);
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Registration Step 2: Verify OTP and complete registration
  const handleRegisterVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!regOtpInput.trim()) {
      setError('Please enter the 6-digit OTP code received on your @msrit.edu email.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regOtpSession?.email || regEmail.trim().toLowerCase(),
          otp: regOtpInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }

      localStorage.setItem('token', data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (student) => {
    if (isAdminMode) return;
    const studentEmail = student.email || `${student.usn.toLowerCase()}@msrit.edu`;
    if (isRegister) {
      setRegName(student.name);
      setRegDob(student.dob || '20-11-2003');
      setRegEmail(studentEmail);
      setRegStep(1);
    } else {
      setLoginName(student.name);
      setLoginEmail(studentEmail);
      setLoginDob(student.dob || '20-11-2003');
      setStep2Email(studentEmail);
      setLoginStep(1);
      setOtpSent(false);
      setOtpSession(null);
    }
    setError(null);
    setResendNotice('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '530px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '0.5rem',
              borderRadius: '10px',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: '700' }}>
                {isRegister 
                  ? 'Student Registration' 
                  : loginStep === 1 
                    ? 'Student Portal Sign In' 
                    : 'Step 2: Email & OTP Verification'}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Ramaiah Institute of Technology (@msrit.edu)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-Step indicator for Sign In */}
        {!isRegister && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(10, 15, 29, 0.75)',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.15rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.74rem',
              fontWeight: '600',
              color: loginStep === 1 ? '#818cf8' : '#34d399'
            }}>
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: loginStep === 1 ? '#6366f1' : 'rgba(52, 211, 153, 0.2)',
                border: loginStep === 1 ? 'none' : '1px solid #34d399',
                color: loginStep === 1 ? '#ffffff' : '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem'
              }}>
                {loginStep === 2 ? '✓' : '1'}
              </div>
              <span>Step 1: Email & DOB</span>
            </div>

            <div style={{ flex: 1, height: '2px', background: loginStep === 2 ? '#34d399' : 'rgba(255, 255, 255, 0.15)' }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.74rem',
              fontWeight: '600',
              color: loginStep === 2 ? '#818cf8' : '#64748b'
            }}>
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: loginStep === 2 ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                border: loginStep === 2 ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                color: loginStep === 2 ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem'
              }}>
                2
              </div>
              <span>Step 2: Email & OTP (@msrit.edu)</span>
            </div>
          </div>
        )}

        {/* Tab Selector: Sign In | Register | Admin Panel */}
        <div style={{
          display: 'flex',
          background: 'rgba(10, 15, 29, 0.9)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.3rem',
          marginBottom: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '0.25rem'
        }}>
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setIsRegister(false); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem 0.3rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: !isAdminMode && !isRegister ? '#ffffff' : '#94a3b8',
              background: !isAdminMode && !isRegister ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              border: !isAdminMode && !isRegister ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setIsRegister(true); setLoginStep(1); setRegStep(1); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem 0.3rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: !isAdminMode && isRegister ? '#ffffff' : '#94a3b8',
              background: !isAdminMode && isRegister ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              border: !isAdminMode && isRegister ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <UserPlus size={13} />
            <span>Register</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(true); setIsRegister(false); setError(null); setResendNotice(''); }}
            style={{
              flex: 1,
              padding: '0.5rem 0.3rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: isAdminMode ? '#ffffff' : '#fbbf24',
              background: isAdminMode ? 'rgba(245, 158, 11, 0.3)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              border: isAdminMode ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={13} />
            <span>Admin Panel</span>
          </button>
        </div>

        {/* Quick Fill Strip */}
        {demoUsers && demoUsers.length > 0 && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.75rem',
            marginBottom: '1.15rem'
          }}>
            <div style={{
              fontSize: '0.72rem',
              color: '#c7d2fe',
              fontWeight: '700',
              marginBottom: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Sparkles size={12} color="#818cf8" />
              <span>1-CLICK AUTO-FILL DEMO PROFILES:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {demoUsers.map(u => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => handleFillDemo(u)}
                  title={`USN: ${u.usn} • DOB: ${u.dob || '20-11-2003'}`}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#e2e8f0',
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>{u.name.split(' ')[0]}</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>({u.usn})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Resend Notice */}
        {resendNotice && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            color: '#34d399',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle2 size={14} />
            <span>{resendNotice}</span>
          </div>
        )}

        {/* Form View */}
        {isAdminMode ? (
          <form onSubmit={handleAdminLogin}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '0.9rem'
            }}>
              <div style={{ fontSize: '0.76rem', color: '#fde68a', fontWeight: '700' }}>
                Restricted Administrator Access — Library Incharge Only
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Enter your private administrator username and password.
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                <User size={13} color="#fbbf24" />
                <span>Admin Username *</span>
              </label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                autoComplete="username"
                required
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                <KeyRound size={13} color="#fbbf24" />
                <span>Admin Password *</span>
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ width: '100%' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In as Library Incharge'}
            </button>
          </form>
        ) : isRegister ? (
          regStep === 1 ? (
            /* Registration Step 1: Input Details (No USN) */
            <form onSubmit={handleRegisterStep1}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    <User size={13} color="#818cf8" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maulik Tondwal"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    <Calendar size={13} color="#f472b6" />
                    <span>Date of Birth *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="DD-MM-YYYY"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Email @msrit.edu (No USN required) */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={13} color="#a78bfa" />
                    <span>Official College Email (@msrit.edu) *</span>
                  </span>
                  <span style={{ fontSize: '0.66rem', color: '#38bdf8' }}>No USN Required</span>
                </label>
                <input
                  type="email"
                  placeholder="student@msrit.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  style={{ width: '100%', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    <GraduationCap size={13} color="#34d399" />
                    <span>Department</span>
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Semester
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Captcha */}
              <div style={{
                background: 'rgba(10, 15, 29, 0.85)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                marginBottom: '1.15rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#c7d2fe', fontWeight: '600' }}>
                    <ShieldCheck size={13} color="#818cf8" />
                    <span>Security CAPTCHA *</span>
                  </label>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    disabled={loadingCaptcha}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={11} className={loadingCaptcha ? 'spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    flexShrink: 0,
                    minWidth: '130px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#090d16',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {captchaData?.captchaSvg ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: captchaData.captchaSvg }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Loading...</span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter code"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      required
                      style={{
                        width: '100%',
                        letterSpacing: '0.2em',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  borderRadius: '8px'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RefreshCw size={14} className="spin" />
                    <span>Dispatching OTP...</span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span>Proceed to Email OTP Verification</span>
                    <ArrowRight size={15} />
                  </span>
                )}
              </button>
            </form>
          ) : (
            /* Registration Step 2: Email OTP Verification */
            <form onSubmit={handleRegisterVerifyOtp}>
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem 0.85rem',
                background: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} color="#34d399" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff' }}>
                    OTP Dispatched to {regOtpSession?.email || regEmail}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                  Please check your email inbox and enter the 6-digit code to activate your account.
                </div>
                {regOtpSession?.previewUrl && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <a
                      href={regOtpSession.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.55rem',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '5px',
                        color: '#38bdf8',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={11} />
                      <span>Open Dispatched Email (Inbox Simulation) ↗</span>
                    </a>
                  </div>
                )}
              </div>

              {/* 6-Digit OTP Input */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#c7d2fe', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Enter 6-Digit OTP Received on Email *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={regOtpInput}
                  onChange={(e) => setRegOtpInput(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    letterSpacing: '0.4em',
                    fontFamily: 'monospace',
                    fontWeight: '800',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    borderColor: regOtpInput.length === 6 ? '#34d399' : '#818cf8',
                    background: '#090d16'
                  }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.35rem',
                  fontSize: '0.72rem',
                  color: '#64748b'
                }}>
                  <span>Code expires in 10 minutes</span>
                  <span>{regOtpInput.length} / 6 digits entered</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || regOtpInput.length !== 6}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  opacity: regOtpInput.length === 6 ? 1 : 0.6
                }}
              >
                {loading ? 'Activating Account...' : 'Verify OTP & Complete Registration'}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.45rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setRegStep(1);
                    fetchCaptcha();
                    setError(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={12} />
                  <span>Back to Step 1</span>
                </button>

                {resendCooldown > 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Resend in {resendCooldown}s
                  </span>
                )}
              </div>
            </form>
          )
        ) : loginStep === 1 ? (
          /* Step 1 Sign In */
          <form onSubmit={handleStep1Login}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={13} color="#818cf8" />
                  <span>Student Full Name</span>
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maulik Tondwal"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  <Mail size={13} color="#38bdf8" />
                  <span>Official Email (@msrit.edu) *</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. 1ms24ci070@msrit.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  style={{ width: '100%', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  <Calendar size={13} color="#f472b6" />
                  <span>Date of Birth *</span>
                </label>
                <input
                  type="text"
                  placeholder="DD-MM-YYYY"
                  value={loginDob}
                  onChange={(e) => setLoginDob(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Captcha */}
            <div style={{
              background: 'rgba(10, 15, 29, 0.85)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              marginBottom: '1.15rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#c7d2fe', fontWeight: '600' }}>
                  <ShieldCheck size={13} color="#818cf8" />
                  <span>Security CAPTCHA *</span>
                </label>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  disabled={loadingCaptcha}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={11} className={loadingCaptcha ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  flexShrink: 0,
                  minWidth: '130px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#090d16',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {captchaData?.captchaSvg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: captchaData.captchaSvg }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Loading...</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter code"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    required
                    style={{
                      width: '100%',
                      letterSpacing: '0.2em',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                borderRadius: '8px'
              }}
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span>Proceed to Step 2 (Email & OTP)</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Type Email, Send OTP, Verify OTP */
          <div>
            {/* Email input & Send OTP button */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem',
              marginBottom: '1.15rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#c7d2fe', fontWeight: '700' }}>
                  <Mail size={14} color="#818cf8" />
                  <span>Type College Email (@msrit.edu) *</span>
                </label>
                <span style={{ fontSize: '0.66rem', color: '#38bdf8' }}>@msrit.edu</span>
              </div>

              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <input
                  type="email"
                  placeholder="e.g. 1ms24ci070@msrit.edu"
                  value={step2Email}
                  onChange={(e) => {
                    setStep2Email(e.target.value);
                    setOtpSent(false);
                  }}
                  required
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || resendCooldown > 0}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#ffffff',
                    background: resendCooldown > 0 ? 'rgba(30, 41, 59, 0.8)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    border: 'none',
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sendingOtp ? (
                    <>
                      <RefreshCw size={12} className="spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>{otpSent ? 'Resend' : 'Send OTP'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* OTP form */}
            <form onSubmit={handleStep2VerifyOtp}>
              {otpSent && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 0.85rem',
                  background: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} color="#34d399" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff' }}>
                      OTP Dispatched to {step2Email}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                    Please check your email inbox and type the 6-digit code below.
                  </div>
                  {otpSession?.previewUrl && (
                    <div style={{ marginTop: '0.2rem' }}>
                      <a
                        href={otpSession.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.3rem 0.55rem',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          borderRadius: '5px',
                          color: '#38bdf8',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={11} />
                        <span>Open Dispatched Email (Inbox Simulation) ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#c7d2fe', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Enter 6-Digit OTP Received on Email *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  disabled={!otpSent}
                  required
                  style={{
                    width: '100%',
                    letterSpacing: '0.4em',
                    fontFamily: 'monospace',
                    fontWeight: '800',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    borderColor: otpInput.length === 6 ? '#34d399' : '#818cf8',
                    background: '#090d16',
                    opacity: otpSent ? 1 : 0.5
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !otpSent || otpInput.length !== 6}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  opacity: (otpSent && otpInput.length === 6) ? 1 : 0.6
                }}
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Enter BookChain'}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.45rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep(1);
                    fetchCaptcha();
                    setError(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={12} />
                  <span>Back to Step 1</span>
                </button>

                {resendCooldown > 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Resend in {resendCooldown}s
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
