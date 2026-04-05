import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCanvasAnimation from "../hooks/useCanvasAnimation";
import { Bell, AlarmClockCheck, Heart, Pill, Calendar, Shield, Menu, X, Zap, BarChart3, RefreshCw } from "lucide-react";

export default function LandingPage() {
  const canvasRef = useRef(null);
  useCanvasAnimation(canvasRef);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', background: 'var(--bg)' }}>
      <canvas ref={canvasRef} className="canvas-bg" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* Landing Navbar */}
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Pill size={20} color="#ef4444" />
            </div>
            <span className="gradient-text">MedRed</span>
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/reminders">Reminders</Link>
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="btn btn-ghost">Sign In</Link>
            <Link to="/login" className="btn btn-primary">Get Started</Link>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}><i className="fas fa-star" /> Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}><i className="fas fa-info-circle" /> How It Works</a>
          <Link to="/login" onClick={() => setMenuOpen(false)}><i className="fas fa-sign-in-alt" /> Sign In / Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
        </div>
        <div className="container">
          <div className="hero-content">
            <span className="badge">
              <i className="fas fa-sparkles" style={{ fontSize: 14 }} />
              AI-Powered Medicine Reminders
            </span>
            <h1>
              Never Miss Your{' '}
              <span className="gradient-text glow-text">Medicine</span>{' '}
              Again
            </h1>
            <p className="hero-description">
              Smart AI-powered reminders that adapt to your schedule. Take control of your health with intelligent medication tracking.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary btn-lg">
                Get Started Free <i className="fas fa-arrow-right" />
              </Link>
              <a href="#how-it-works" className="btn btn-outline btn-lg">Watch Demo</a>
            </div>
            <div className="stats">
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Reliability</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500K+</div>
                <div className="stat-label">Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9★</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>
          <div className="floating-icon floating-icon-1">
            <Bell size={32} color="var(--primary)" />
          </div>
          <div className="floating-icon floating-icon-2">
            <Heart size={32} color="var(--primary)" />
          </div>
          <div className="floating-icon floating-icon-3">
            <Calendar size={32} color="var(--primary)" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Features</p>
            <h2 className="section-title">
              Everything You Need to Stay <span className="gradient-text">Healthy</span>
            </h2>
            <p className="section-description">
              Powerful features designed to make medication management effortless and reliable.
            </p>
          </div>
          <div className="features-grid">
            {[
              { icon: AlarmClockCheck, title: 'Smart Reminders', desc: 'AI-powered notifications that adapt to your routine and never let you miss a dose.' },
              { icon: Calendar, title: 'Schedule Tracking', desc: 'Visual calendar interface to manage all your medications in one place.' },
              { icon: RefreshCw, title: 'Cross-Platform Sync', desc: 'Seamlessly access your medication schedule across all devices.' },
              { icon: Shield, title: 'Privacy First', desc: 'Military-grade encryption keeps your health data secure and private.' },
              { icon: Zap, title: 'Instant Alerts', desc: 'Get real-time push notifications, SMS, and email reminders.' },
              { icon: BarChart3, title: 'History Tracking', desc: 'Complete medication history and analytics for your healthcare provider.' },
            ].map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">
                  <f.icon size={28} color="var(--primary)" />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.desc}</p>
                <div className="feature-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Simple Process</p>
            <h2 className="section-title">
              How <span className="gradient-text">MedRed</span> Works
            </h2>
            <p className="section-description">
              Get started in three simple steps and take control of your medication routine.
            </p>
          </div>
          <div className="steps-grid">
            {[
              { icon: Pill, num: '01', title: 'Add Medications', desc: 'Scan or manually enter your prescriptions. Our AI creates an optimized schedule.' },
              { icon: Bell, num: '02', title: 'Set Reminders', desc: 'Customize notification preferences for each medication and time.' },
              { icon: BarChart3, num: '03', title: 'Stay On Track', desc: 'Receive timely alerts and track your adherence with detailed analytics.' },
            ].map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-icon-wrapper">
                  <div className="step-icon">
                    <s.icon size={48} color="var(--primary)" />
                  </div>
                  <div className="step-number">{s.num}</div>
                </div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-description">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="section" id="dashboard">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Dashboard</p>
            <h2 className="section-title">Everything at a Glance</h2>
            <p className="section-description">Beautiful, intuitive dashboard to manage your health.</p>
          </div>
          <div className="dash-preview-grid">
            <div className="dash-preview-card">
              <h3 style={{ marginBottom: '1.5rem' }}>Weekly Adherence</h3>
              <div className="progress-bar-wrap"><div className="progress-bar-fill" /></div>
              <p style={{ color: 'var(--muted)', margin: '1rem 0' }}>78% adherence this week. Great work!</p>
              <div className="pill-tags">
                <div className="pill-tag"><div className="dot dot-green" /><span>Taken: 6</span></div>
                <div className="pill-tag"><div className="dot dot-yellow" /><span>Due: 2</span></div>
                <div className="pill-tag"><div className="dot dot-red" /><span>Missed: 0</span></div>
              </div>
            </div>
            <div className="dash-preview-card">
              <h3 style={{ marginBottom: '1.5rem' }}>Upcoming</h3>
              <div className="med-list-preview">
                {[
                  { name: 'Metformin', time: '8:00 AM • With food', status: 'Due Soon', cls: 'status-due' },
                  { name: 'Lisinopril', time: '1:00 PM • After lunch', status: 'Scheduled', cls: 'status-sched' },
                  { name: 'Atorvastatin', time: '10:00 PM • Bedtime', status: 'Scheduled', cls: 'status-sched' },
                ].map((m, i) => (
                  <div className="med-item-preview" key={i}>
                    <div><h4>{m.name}</h4><div className="med-time-text">{m.time}</div></div>
                    <div className={`med-status ${m.cls}`}>{m.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg" />
            <div className="cta-content">
              <span className="badge">
                <i className="fas fa-fire" style={{ fontSize: 14 }} /> Limited Time Offer
              </span>
              <h2 className="cta-title">
                Ready to Transform Your{' '}
                <span className="gradient-text glow-text">Health Routine?</span>
              </h2>
              <p className="cta-description">Join thousands who never miss their medication. Start free today.</p>
              <div className="cta-buttons">
                <Link to="/login" className="btn btn-primary btn-lg">
                  Start Free Trial <i className="fas fa-arrow-right" />
                </Link>
                <a href="#how-it-works" className="btn btn-outline btn-lg">Schedule Demo</a>
              </div>
              <div className="cta-features">
                {['Free 30-day trial', 'No credit card needed', 'Cancel anytime'].map((f, i) => (
                  <div className="cta-feature" key={i}><div className="dot dot-red" />{f}</div>
                ))}
              </div>
            </div>
            <div className="cta-glow-1" /><div className="cta-glow-2" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <Pill size={20} color="#ef4444" />
                </div>
                <span className="gradient-text">MedRed</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                Smart medication reminders for a healthier tomorrow.
              </p>
            </div>
            <div>
              <h3 className="footer-title">Product</h3>
              <ul className="footer-links">
                <li><a href="#dashboard">Dashboard</a></li>
                <li><a href="#how-it-works">Reminders</a></li>
                <li><a href="#features">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="footer-title">Company</h3>
              <ul className="footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="footer-title">Legal</h3>
              <ul className="footer-links">
                <li><a href="#privacy">Privacy</a></li>
                <li><a href="#terms">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 MedRed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}