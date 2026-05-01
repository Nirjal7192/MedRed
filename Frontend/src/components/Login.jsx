import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCanvasAnimation from "../hooks/useCanvasAnimation";
import { Pill } from "lucide-react";

export default function LoginPage() {
  const canvasRef = useRef(null);
  useCanvasAnimation(canvasRef);
  const [tab, setTab] = useState('signin');
  const navigate = useNavigate();

  /* ── SIGN IN state ── */
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  /* ── SIGN UP state ── */
  const [signupData, setSignupData] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState('');

  const validateEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateName  = n => n.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(n.trim());

  function getStrength(pw) {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^a-zA-Z\d]/.test(pw)) s++;
    return s <= 2 ? 'weak' : s <= 4 ? 'medium' : 'strong';
  }

  function handleLogin(e) {
    e.preventDefault();
    const errs = {};
    if (!validateEmail(loginData.email)) errs.email = 'Please enter a valid email address';
    if (loginData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;

    setLoginLoading(true);
    // API call would go here; for demo we navigate after a short delay
    fetch('/api/login', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: loginData.email, password: loginData.password }).toString(),
    })
      .then(r => { if (r.redirected || r.ok) navigate('/dashboard'); else return r.json().then(d => setLoginErrors({ password: d.detail || 'Login failed' })); })
      .catch(() => setLoginErrors({ password: 'Network error. Please try again.' }))
      .finally(() => setLoginLoading(false));
  }

  function handleSignup(e) {
    e.preventDefault();
    const errs = {};
    if (!validateName(signupData.firstName))    errs.firstName = 'First name must be at least 2 characters';
    if (!validateName(signupData.lastName))     errs.lastName  = 'Last name must be at least 2 characters';
    if (!validateEmail(signupData.email))       errs.email     = 'Please enter a valid email address';
    if (signupData.password.length < 6)         errs.password  = 'Password must be at least 6 characters';
    if (signupData.password !== signupData.confirm) errs.confirm = 'Passwords do not match';
    setSignupErrors(errs);
    if (Object.keys(errs).length) return;

    setSignupLoading(true);
    const body = new URLSearchParams({
      username: `${signupData.firstName} ${signupData.lastName}`,
      email: signupData.email, password: signupData.password,
    }).toString();
    fetch('/api/register/', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    })
      .then(r => { if (r.redirected || r.ok) navigate('/info'); else return r.json().then(d => setSignupErrors({ email: d.detail || 'Registration failed' })); })
      .catch(() => setSignupErrors({ email: 'Network error. Please try again.' }))
      .finally(() => setSignupLoading(false));
  }

  return (
    <div className="login-page">
      <canvas ref={canvasRef} className="canvas-bg" />
      <div className="blob blob-1" /><div className="blob blob-2" />

      {/* Minimal navbar */}
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Pill color="#4CAF50" />
            </div>
            <span className="gradient-text">MedRed</span>
          </Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="login-content">
        <div className="auth-wrap">
          <div className="auth-card">
            <div className="card-glow" />
            <div className="auth-header">
              <h2>{tab === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{tab === 'signin' ? 'Sign in to continue to MedRed' : 'Join MedRed today'}</p>
            </div>

            <div className="tab-row">
              <button className={`tab-btn ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')}>Sign In</button>
              <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
            </div>

            {/* ── SIGN IN ── */}
            {tab === 'signin' && (
              <form onSubmit={handleLogin} noValidate>
                <div className="fg">
                  <label className="flabel">Email</label>
                  <input type="email" className={`finput ${loginErrors.email ? 'err' : ''}`}
                    placeholder="you@example.com" value={loginData.email}
                    onChange={e => { setLoginData(d => ({ ...d, email: e.target.value })); setLoginErrors(er => ({ ...er, email: '' })); }} />
                  {loginErrors.email && <div className="ferr">{loginErrors.email}</div>}
                </div>
                <div className="fg">
                  <label className="flabel">Password</label>
                  <div className="pw-wrap">
                    <input type={showLoginPw ? 'text' : 'password'}
                      className={`finput ${loginErrors.password ? 'err' : ''}`}
                      placeholder="Enter your password" value={loginData.password}
                      onChange={e => { setLoginData(d => ({ ...d, password: e.target.value })); setLoginErrors(er => ({ ...er, password: '' })); }} />
                    <button type="button" className="pw-toggle" onClick={() => setShowLoginPw(v => !v)}>
                      <i className={`fas fa-eye${showLoginPw ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {loginErrors.password && <div className="ferr">{loginErrors.password}</div>}
                </div>
                <a href="#forgot" className="forgot-link">Forgot your password?</a>
                <button type="submit" className="btn-submit" disabled={loginLoading}>
                  {loginLoading ? <><span className="spin-icon" /> Signing In...</> : 'Sign In'}
                </button>
                <div className="divider-or"><span>or continue with</span></div>
                <div className="social-row">
                  <button type="button" className="btn-social" onClick={() => alert('Google login coming soon')}>
                    <i className="fab fa-google" /> Google
                  </button>
                </div>
              </form>
            )}

            {/* ── SIGN UP ── */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} noValidate>
                <div className="frow">
                  <div className="fg fhalf">
                    <label className="flabel">First Name</label>
                    <input type="text" className={`finput ${signupErrors.firstName ? 'err' : ''}`}
                      placeholder="John" value={signupData.firstName}
                      onChange={e => { setSignupData(d => ({ ...d, firstName: e.target.value })); setSignupErrors(er => ({ ...er, firstName: '' })); }} />
                    {signupErrors.firstName && <div className="ferr">{signupErrors.firstName}</div>}
                  </div>
                  <div className="fg fhalf">
                    <label className="flabel">Last Name</label>
                    <input type="text" className={`finput ${signupErrors.lastName ? 'err' : ''}`}
                      placeholder="Doe" value={signupData.lastName}
                      onChange={e => { setSignupData(d => ({ ...d, lastName: e.target.value })); setSignupErrors(er => ({ ...er, lastName: '' })); }} />
                    {signupErrors.lastName && <div className="ferr">{signupErrors.lastName}</div>}
                  </div>
                </div>
                <div className="fg">
                  <label className="flabel">Email</label>
                  <input type="email" className={`finput ${signupErrors.email ? 'err' : ''}`}
                    placeholder="you@example.com" value={signupData.email}
                    onChange={e => { setSignupData(d => ({ ...d, email: e.target.value })); setSignupErrors(er => ({ ...er, email: '' })); }} />
                  {signupErrors.email && <div className="ferr">{signupErrors.email}</div>}
                </div>
                <div className="fg">
                  <label className="flabel">Password</label>
                  <div className="pw-wrap">
                    <input type={showPw ? 'text' : 'password'}
                      className={`finput ${signupErrors.password ? 'err' : ''}`}
                      placeholder="Create a password" value={signupData.password}
                      onChange={e => { setSignupData(d => ({ ...d, password: e.target.value })); setSignupErrors(er => ({ ...er, password: '' })); setStrength(e.target.value ? getStrength(e.target.value) : ''); }} />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                      <i className={`fas fa-eye${showPw ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {strength && (
                    <>
                      <div className="strength-bar"><div className={`strength-fill s-${strength}`} /></div>
                      <div className="strength-txt">{{ weak: 'Weak password', medium: 'Medium password', strong: 'Strong password' }[strength]}</div>
                    </>
                  )}
                  {signupErrors.password && <div className="ferr">{signupErrors.password}</div>}
                </div>
                <div className="fg">
                  <label className="flabel">Confirm Password</label>
                  <div className="pw-wrap">
                    <input type={showConfirm ? 'text' : 'password'}
                      className={`finput ${signupErrors.confirm ? 'err' : ''}`}
                      placeholder="Confirm your password" value={signupData.confirm}
                      onChange={e => { setSignupData(d => ({ ...d, confirm: e.target.value })); setSignupErrors(er => ({ ...er, confirm: '' })); }} />
                    <button type="button" className="pw-toggle" onClick={() => setShowConfirm(v => !v)}>
                      <i className={`fas fa-eye${showConfirm ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {signupErrors.confirm && <div className="ferr">{signupErrors.confirm}</div>}
                </div>
                <button type="submit" className="btn-submit" disabled={signupLoading}>
                  {signupLoading ? <><span className="spin-icon" /> Creating Account...</> : 'Create Account'}
                </button>
                <div className="divider-or"><span>or continue with</span></div>
                <div className="social-row">
                  <button type="button" className="btn-social" onClick={() => alert('Google signup coming soon')}>
                    <i className="fab fa-google" /> Google
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}