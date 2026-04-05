import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, Pill } from "lucide-react";

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const navigate = useNavigate();
  const avatarRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user
    ? ((user.fname?.[0] || '') + (user.lname?.[0] || '')).toUpperCase() || 'U'
    : 'U';

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Pill size={20} color="#ef4444" />
          </div>
          <span className="gradient-text">MedRed</span>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/reminders">Reminders</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div ref={avatarRef} className="avatar-wrap">
            <div className="avatar" onClick={() => setAvatarOpen(o => !o)}>{initials}</div>
            <div className={`user-menu ${avatarOpen ? 'show' : ''}`}>
              <div className="menu-item">
                <i className="fas fa-user" style={{ width: 16 }} />
                {user ? `${user.fname} ${user.lname}` : 'Profile'}
              </div>
              <div className="menu-item" onClick={() => { navigate('/dashboard'); setAvatarOpen(false); }}>
                <i className="fas fa-th-large" style={{ width: 16 }} /> Dashboard
              </div>
              <div className="menu-item" onClick={() => { navigate('/reminders'); setAvatarOpen(false); }}>
                <Bell size={16} style={{ width: 16 }} /> Reminders
              </div>
              <div className="menu-divider" />
              <button className="menu-item danger" onClick={() => { navigate('/login'); setAvatarOpen(false); }}>
                <i className="fas fa-sign-out-alt" style={{ width: 16 }} /> Logout
              </button>
            </div>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(o => !o)}>
            <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`} />
          </button>
        </div>
      </div>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
          <i className="fas fa-th-large" /> Dashboard
        </Link>
        <Link to="/reminders" onClick={() => setMenuOpen(false)}>
          <i className="fas fa-bell" /> Reminders
        </Link>
        <button
          className="btn btn-primary"
          style={{ marginTop: '0.5rem' }}
          onClick={() => { navigate('/login'); setMenuOpen(false); }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}