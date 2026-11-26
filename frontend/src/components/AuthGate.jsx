import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Hash, 
  User, 
  Mail, 
  GraduationCap, 
  Award, 
  Link as LinkIcon, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Send,
  ExternalLink 
} from 'lucide-react';

export default function AuthGate({
  onAuthSuccess,
  demoUsers,
  onOpenSynopsis
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loginStep, setLoginStep] = useState(1); // 1 = Email & DOB & CAPTCHA, 2 = Email OTP
  const [regStep, setRegStep] = useState(1);     // 1 = Form Details, 2 = Email OTP Verification

  // Admin Login state (No USN)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Login Step 1 state: Name (optional), Email (No USN), DOB, Captcha
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginDob, setLoginDob] = useState('');

  // Login Step 2 state: Email to type & OTP
  const [step2Email, setStep2Email] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSession, setOtpSession] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState('');

  // Register form state: Name, USN, DOB, Email, Department, Semester, Captcha
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

  // Timer for OTP resend cooldown
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
    fetchCaptcha();
    setError(null);
    setResendNotice('');
    setRegStep(1);
    setLoginStep(1);
  }, [isRegister]);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 1 Login: Verify Email (No USN) & DOB & CAPTCHA -> Move to Step 2
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
        throw new Error(data.message || 'Authentication step 1 failed');
      }

      setLoginStep(2);
      setStep2Email(data.suggestedEmail || loginEmail.trim().toLowerCase());
      setOtpSent(false);
      setOtpInput('');
      setOtpSession(null);
    } catch (err) {
      setError(err.message);
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Action: Student confirms their @msrit.edu email and clicks "Send OTP"
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!step2Email.trim()) {
      setError('Please enter your college email address.');
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
      setOtpInput('');
      setResendCooldown(30);
      setResendNotice(`OTP dispatched to ${data.email}! Check your email inbox.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2 Login Action: Student submits OTP received on email
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

  // Registration Step 2: Verify OTP and activate registered student account
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, #090d16 70%)',
      color: '#f8fafc'
    }}>
      {/* Top Banner Bar */}
      <header style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(9, 13, 22, 0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)'
          }}>
            <LinkIcon size={20} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '800',
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              BookChain
              <span style={{
                fontSize: '0.62rem',
                fontWeight: '700',
                padding: '0.15rem 0.45rem',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                borderRadius: '999px',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                letterSpacing: '0.05em'
              }}>MERN</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Ramaiah Institute of Technology • Academic Peer-to-Peer Ownership Chain
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onOpenSynopsis}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <Award size={14} />
            <span>Project Synopsis (24CIE554)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
          backdropFilter: 'blur(16px)'
        }}>
          {/* Card Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '999px',
            fontSize: '0.74rem',
            color: '#c7d2fe',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            <ShieldCheck size={14} color="#818cf8" />
            <span>MANDATORY 2-STEP STUDENT AUTHENTICATION</span>
          </div>

          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            marginBottom: '0.35rem',
            color: '#ffffff'
          }}>
            {isRegister 
              ? regStep === 1 
                ? 'Register Student Profile' 
                : 'Step 2: Email OTP Verification'
              : loginStep === 1 
                ? 'Student Portal Sign In' 
                : 'Step 2: Email Verification & OTP'}
          </h1>
          <p style={{
            fontSize: '0.84rem',
            color: '#94a3b8',
            marginBottom: '1.35rem',
            lineHeight: '1.5'
          }}>
            {isRegister
              ? regStep === 1
                ? 'Register with your Name, USN, DOB, and official college email ending with @msrit.edu.'
                : 'Enter the 6-digit verification code sent to your @msrit.edu email to complete registration.'
              : loginStep === 1
                ? 'Step 1: Enter your Official Email (@msrit.edu), Date of Birth (DOB), and Security CAPTCHA.'
                : 'Step 2: Enter your @msrit.edu college email, click "Send OTP", then enter the received code.'
            }
          </p>

          {/* 2-Step Progress Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(10, 15, 29, 0.75)',
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: (isRegister ? regStep === 1 : loginStep === 1) ? '#818cf8' : '#34d399'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: (isRegister ? regStep === 1 : loginStep === 1) ? '#6366f1' : 'rgba(52, 211, 153, 0.2)',
                border: (isRegister ? regStep === 1 : loginStep === 1) ? 'none' : '1px solid #34d399',
                color: (isRegister ? regStep === 1 : loginStep === 1) ? '#ffffff' : '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem'
              }}>
                {(isRegister ? regStep === 2 : loginStep === 2) ? '✓' : '1'}
              </div>
              <span>Step 1: {isRegister ? 'Registration Details' : 'Credentials'}</span>
            </div>

            <div style={{ flex: 1, height: '2px', background: (isRegister ? regStep === 2 : loginStep === 2) ? '#34d399' : 'rgba(255, 255, 255, 0.15)' }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: (isRegister ? regStep === 2 : loginStep === 2) ? '#818cf8' : '#64748b'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: (isRegister ? regStep === 2 : loginStep === 2) ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                border: (isRegister ? regStep === 2 : loginStep === 2) ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                color: (isRegister ? regStep === 2 : loginStep === 2) ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem'
              }}>
                2
              </div>
              <span>Step 2: Email OTP (@msrit.edu)</span>
            </div>
          </div>

          {/* Tab Selector: Sign In | Register | Admin Panel */}
          <div style={{
            display: 'flex',
            background: 'rgba(10, 15, 29, 0.9)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.3rem',
            marginBottom: '1.35rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '0.25rem'
          }}>
            <button
              type="button"
              onClick={() => { setIsAdminMode(false); setIsRegister(false); setError(null); }}
              style={{
                flex: 1,
                padding: '0.55rem 0.35rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: !isAdminMode && !isRegister ? '#ffffff' : '#94a3b8',
                background: !isAdminMode && !isRegister ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                border: !isAdminMode && !isRegister ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsAdminMode(false); setIsRegister(true); setRegStep(1); setError(null); }}
              style={{
                flex: 1,
                padding: '0.55rem 0.35rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: !isAdminMode && isRegister ? '#ffffff' : '#94a3b8',
                background: !isAdminMode && isRegister ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                border: !isAdminMode && isRegister ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <UserPlus size={14} />
              <span>Register</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsAdminMode(true); setIsRegister(false); setError(null); setResendNotice(''); }}
              style={{
                flex: 1,
                padding: '0.55rem 0.35rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: isAdminMode ? '#ffffff' : '#fbbf24',
                background: isAdminMode ? 'rgba(245, 158, 11, 0.3)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                border: isAdminMode ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={14} />
              <span>Admin Panel</span>
            </button>
          </div>

          {/* Demo Profiles Strip */}
          {!isAdminMode && demoUsers && demoUsers.length > 0 && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{
                fontSize: '0.74rem',
                color: '#c7d2fe',
                fontWeight: '700',
                marginBottom: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={13} color="#818cf8" />
                <span>1-CLICK AUTO-FILL DEMO PROFILES (NO USN NEEDED):</span>
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {demoUsers.map(u => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => handleFillDemo(u)}
                    title={`Email: ${u.email} • DOB: ${u.dob || '20-11-2003'}`}
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#e2e8f0',
                      fontSize: '0.74rem',
                      padding: '0.3rem 0.55rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span style={{ fontWeight: '600' }}>{u.name.split(' ')[0]}</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.68rem' }}>({u.email})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              marginBottom: '1.15rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Resend / Sent Notice */}
          {resendNotice && (
            <div style={{
              background: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#34d399',
              padding: '0.65rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              marginBottom: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              <CheckCircle2 size={15} />
              <span>{resendNotice}</span>
            </div>
          )}

          {/* ================= ADMIN PANEL LOGIN VIEW (SECURED — NO CREDENTIALS SHOWN) ================= */}
          {isAdminMode ? (
            <form onSubmit={handleAdminLogin}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.78rem', color: '#fde68a', fontWeight: '700' }}>
                  Restricted Administrator Access — Library Incharge Only
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Authorized personnel must enter their private username and password.
                </div>
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
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

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
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
                  padding: '0.85rem',
                  fontSize: '0.95rem',
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
              /* Registration Step 1: Input Details (No USN required) */
              <form onSubmit={handleRegisterStep1}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
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

                {/* Email with strict @msrit.edu constraint (No USN required) */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} color="#a78bfa" />
                      <span>Official College Email (@msrit.edu) *</span>
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>No USN Required</span>
                  </label>
                  <input
                    type="email"
                    placeholder="student@msrit.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    style={{ width: '100%', fontFamily: 'monospace' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Must end with <strong style={{ color: '#c7d2fe' }}>@msrit.edu</strong> (An OTP will be dispatched to this address).
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
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
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
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

                {/* CAPTCHA SECTION */}
                <div style={{
                  background: 'rgba(10, 15, 29, 0.85)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  marginBottom: '1.35rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#c7d2fe', fontWeight: '600' }}>
                      <ShieldCheck size={14} color="#818cf8" />
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
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        padding: '0.1rem 0.3rem'
                      }}
                    >
                      <RefreshCw size={12} className={loadingCaptcha ? 'spin' : ''} />
                      <span>Refresh Code</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      flexShrink: 0,
                      minWidth: '140px',
                      height: '45px',
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
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Loading...</span>
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
                          fontSize: '1rem',
                          textTransform: 'uppercase',
                          borderColor: captchaInput ? '#818cf8' : undefined
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit to Step 2 OTP */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    borderRadius: '8px'
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={16} className="spin" />
                      <span>Dispatching Email OTP...</span>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Proceed to Email OTP Verification</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              /* Registration Step 2: Email OTP Verification */
              <form onSubmit={handleRegisterVerifyOtp}>
                <div style={{
                  marginBottom: '1.15rem',
                  padding: '0.85rem 1rem',
                  background: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Mail size={18} color="#34d399" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>
                      OTP Dispatched to {regOtpSession?.email || regEmail}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    Please check your email inbox, find your 6-digit registration code, and enter it below to activate your student account.
                  </div>
                  {regOtpSession?.previewUrl && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <a
                        href={regOtpSession.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontSize: '0.74rem',
                          fontWeight: '600',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>Open Dispatched Email to view OTP (Dev Inbox) ↗</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* 6-Digit OTP Input */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#c7d2fe', fontWeight: '600', marginBottom: '0.45rem' }}>
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
                      letterSpacing: '0.5em',
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      borderColor: regOtpInput.length === 6 ? '#34d399' : '#818cf8',
                      background: '#090d16'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.45rem',
                    fontSize: '0.74rem',
                    color: '#64748b'
                  }}>
                    <span>Code expires in 10 minutes</span>
                    <span>{regOtpInput.length} / 6 digits entered</span>
                  </div>
                </div>

                {/* Submit to complete registration */}
                <button
                  type="submit"
                  disabled={loading || regOtpInput.length !== 6}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    borderRadius: '8px',
                    marginBottom: '0.85rem',
                    opacity: regOtpInput.length === 6 ? 1 : 0.6
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={16} className="spin" />
                      <span>Activating Student Account...</span>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} />
                      <span>Verify OTP & Complete Registration</span>
                    </span>
                  )}
                </button>

                {/* Back and Resend */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
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
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRegisterStep1}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: resendCooldown > 0 ? '#64748b' : '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: resendCooldown > 0 ? 'default' : 'pointer'
                    }}
                  >
                    <Send size={13} />
                    <span>
                      {resendCooldown > 0 
                        ? `Resend in ${resendCooldown}s` 
                        : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </form>
            )
          ) : loginStep === 1 ? (
            /* ================= SIGN IN STEP 1: CREDENTIALS & CAPTCHA ================= */
            <form onSubmit={handleStep1Login}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={13} color="#818cf8" />
                    <span>Student Full Name</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>(Optional / Auto-verify)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maulik Tondwal"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    <Calendar size={13} color="#f472b6" />
                    <span>Date of Birth (DOB) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="DD-MM-YYYY (e.g. 20-11-2003)"
                    value={loginDob}
                    onChange={(e) => setLoginDob(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* CAPTCHA SECTION */}
              <div style={{
                background: 'rgba(10, 15, 29, 0.85)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                marginBottom: '1.35rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#c7d2fe', fontWeight: '600' }}>
                    <ShieldCheck size={14} color="#818cf8" />
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
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                      padding: '0.1rem 0.3rem'
                    }}
                  >
                    <RefreshCw size={12} className={loadingCaptcha ? 'spin' : ''} />
                    <span>Refresh Code</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    flexShrink: 0,
                    minWidth: '140px',
                    height: '45px',
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
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Loading...</span>
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
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        borderColor: captchaInput ? '#818cf8' : undefined
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit to Step 2 */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  borderRadius: '8px'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Proceed to Step 2 (Email & OTP)</span>
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN IN STEP 2: TYPE EMAIL & SEND/VERIFY OTP ================= */
            <div>
              {/* Part 2A: Enter College Email & Click "Send OTP" */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#c7d2fe', fontWeight: '700' }}>
                    <Mail size={15} color="#818cf8" />
                    <span>Type Your College Email (@msrit.edu) *</span>
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>Ramaiah Institute of Technology</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                      fontSize: '0.9rem',
                      borderColor: step2Email.toLowerCase().endsWith('@msrit.edu') ? '#34d399' : '#818cf8'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || resendCooldown > 0}
                    style={{
                      padding: '0.65rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      background: resendCooldown > 0 ? 'rgba(30, 41, 59, 0.8)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      border: 'none',
                      cursor: resendCooldown > 0 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sendingOtp ? (
                      <>
                        <RefreshCw size={13} className="spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>{otpSent ? 'Resend OTP' : 'Send OTP'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  Email must end with <strong style={{ color: '#c7d2fe' }}>@msrit.edu</strong>. Click <strong>"Send OTP"</strong> to receive your 6-digit code.
                </div>
              </div>

              {/* Part 2B: Enter OTP Received on Email */}
              <form onSubmit={handleStep2VerifyOtp}>
                {otpSent && (
                  <div style={{
                    marginBottom: '1.15rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(52, 211, 153, 0.12)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Mail size={18} color="#34d399" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>
                        OTP Dispatched to {step2Email}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                      Please check your email inbox, find your 6-digit code, and enter it below.
                    </div>
                    {otpSession?.previewUrl && (
                      <div style={{ marginTop: '0.35rem' }}>
                        <a
                          href={otpSession.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            borderRadius: '6px',
                            color: '#38bdf8',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Open Dispatched Email to view OTP (Inbox Simulation) ↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* 6-Digit OTP Input */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#c7d2fe', fontWeight: '600', marginBottom: '0.45rem' }}>
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
                      letterSpacing: '0.5em',
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      borderColor: otpInput.length === 6 ? '#34d399' : '#818cf8',
                      background: '#090d16',
                      opacity: otpSent ? 1 : 0.5
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.45rem',
                    fontSize: '0.74rem',
                    color: '#64748b'
                  }}>
                    <span>{otpSent ? 'Enter code from your email' : 'Click "Send OTP" above first'}</span>
                    <span>{otpInput.length} / 6 digits entered</span>
                  </div>
                </div>

                {/* Submit OTP */}
                <button
                  type="submit"
                  disabled={loading || !otpSent || otpInput.length !== 6}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    borderRadius: '8px',
                    marginBottom: '0.85rem',
                    opacity: (otpSent && otpInput.length === 6) ? 1 : 0.6
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={16} className="spin" />
                      <span>Verifying OTP...</span>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={16} />
                      <span>Verify OTP & Enter BookChain</span>
                    </span>
                  )}
                </button>

                {/* Navigation and Resend status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
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
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      padding: '0.2rem 0'
                    }}
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Step 1</span>
                  </button>

                  {resendCooldown > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Resend available in {resendCooldown}s
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer Note */}
      <footer style={{
        padding: '1.25rem 2rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#64748b',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        BookChain Academic Ownership Chain • Course 24CIE554 • MSRIT College Domain (@msrit.edu) • Developed by Ashwath G Hegde & Maulik Tondwal
      </footer>
    </div>
  );
}
