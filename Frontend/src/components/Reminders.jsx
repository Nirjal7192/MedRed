import Navbar from "../components/Navbar";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Pill } from "lucide-react";
const MOCK_REMINDERS = []

export default function Reminders() {
  const [reminders, setReminders] = useState(MOCK_REMINDERS.map(r => ({ ...r, active: true })));
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // New reminder form state
  const [newRem, setNewRem] = useState({ medicineName: '', dosage: '', time: '', notes: '' });
  const [activeDays, setActiveDays] = useState([]);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function showToast(msg) {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }

  function getTimeLabel(t) {
    if (!t) return '';
    const h = parseInt(t.split(':')[0]);
    if (h >= 5 && h < 12) return '🌅 Morning';
    if (h >= 12 && h < 17) return '☀️ Afternoon';
    if (h >= 17 && h < 21) return '🌆 Evening';
    return '🌙 Night';
  }

  function addReminder(e) {
    e.preventDefault();
    if (!newRem.medicineName || !newRem.dosage || !newRem.time) return alert('Please fill all required fields');
    const entry = { ...newRem, id: Date.now(), active: true };
    setReminders(r => [...r, entry]);
    setNewRem({ medicineName: '', dosage: '', time: '', notes: '' });
    setActiveDays([]);
    setPanelOpen(false);
    showToast('✓ Reminder added successfully!');

    fetch('/api/reminders/add', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {});
  }

  function deleteReminder(id) {
    if (!window.confirm('Delete this reminder?')) return;
    setReminders(r => r.filter(x => x.id !== id));
    showToast('✓ Reminder deleted');
    fetch(`/api/reminders/delete/${id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
  }

  function toggleActive(id) {
    setReminders(r => r.map(x => x.id === id ? { ...x, active: !x.active } : x));
  }

  const filtered = reminders.filter(r => {
    const matchSearch = r.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      r.dosage.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'active') return r.active;
    if (filter === 'paused') return !r.active;
    if (filter === 'today') return true;
    return true;
  });

  const initials = 'JD';

  return (
    <div className="rem-page">
      {/* Navbar */}
      <header className="rp-nav">
        <div className="rp-nav-inner">
          <Link to="/dashboard" className="rp-brand">
            <div className="rp-logo">
              <Pill size={20} color="#f1e6e6" />
            </div>
            <span className="rp-brand-name">MedRed</span>
          </Link>
          <div className="rp-avatar">{initials}</div>
        </div>
      </header>

      <main className="rp-container">
        {/* Header */}
        <div className="rp-header">
          <div>
            <div className="rp-title">Medicine Reminders</div>
            <div className="rp-subtitle">Create, schedule, and manage your medication reminders.</div>
          </div>
          <button className="rp-btn rp-btn-primary" onClick={() => setPanelOpen(true)}>
            ➕ Add Reminder
          </button>
        </div>

        {/* EKG Strip */}
        <div className="ekg" aria-hidden="true">
          <svg viewBox="0 0 1200 120">
            <path d="M0,60 L120,60 L160,60 170,40 180,80 190,20 205,90 220,60 L380,60 L420,60 430,40 440,80 450,20 465,90 480,60 L640,60 L680,60 690,40 700,80 710,20 725,90 740,60 L900,60 L940,60 950,40 960,80 970,20 985,90 1000,60 L1200,60" />
          </svg>
          <div className="ekg-gradient" />
        </div>

        {/* Actions Bar */}
        <div className="rp-bar">
          <div className="rp-left">
            <div className="rp-seg">
              {['all', 'today', 'active', 'paused'].map(f => (
                <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="rp-right">
            <input className="rp-search" placeholder="Search medicine, dosage..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Reminder List */}
        <div className="rp-list">
          {filtered.length === 0 ? (
            <div className="rp-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>No reminders found</div>
              <div>Click "Add Reminder" to create your first medicine reminder</div>
            </div>
          ) : filtered.map((r, idx) => (
            <div className="rp-card" key={r.id} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="rp-card-left">
                <div className="title-row">
                  <div className="rp-pill">💊</div>
                  <div>
                    <div className="rp-med-name">{r.medicineName}</div>
                    <div className="rp-dose">{r.dosage}</div>
                  </div>
                </div>
                <div className="rp-meta">
                  <span>{formatTime(r.time)}</span>
                  <div className="rp-dot" />
                  <span>{getTimeLabel(r.time)}</span>
                  {r.notes && <><div className="rp-dot" /><span>{r.notes}</span></>}
                </div>
              </div>
              <div className="rp-actions">
                <button className="rp-chip" onClick={() => deleteReminder(r.id)}>🗑️ Delete</button>
                <div className={`rp-switch ${r.active ? 'on' : ''}`} onClick={() => toggleActive(r.id)}>
                  <div className="rp-knob" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Slide-over panel */}
      <div className={`rp-overlay ${panelOpen ? 'open' : ''}`} onClick={() => setPanelOpen(false)} />
      <div className={`rp-panel ${panelOpen ? 'open' : ''}`}>
        <div className="rp-panel-hdr">
          <span className="rp-panel-title">Add New Reminder</span>
          <button className="rp-btn" onClick={() => setPanelOpen(false)}>✕</button>
        </div>
        <form onSubmit={addReminder} className="rp-panel-body">
          <div className="rp-field">
            <label className="rp-flabel">Medicine Name *</label>
            <input className="rp-finput" placeholder="e.g., Metformin" required
              value={newRem.medicineName}
              onChange={e => setNewRem(d => ({ ...d, medicineName: e.target.value }))} />
          </div>
          <div className="rp-field">
            <label className="rp-flabel">Dosage *</label>
            <input className="rp-finput" placeholder="e.g., 500mg" required
              value={newRem.dosage}
              onChange={e => setNewRem(d => ({ ...d, dosage: e.target.value }))} />
          </div>
          <div className="rp-field">
            <label className="rp-flabel">Time *</label>
            <input type="time" className="rp-finput" required
              value={newRem.time}
              onChange={e => setNewRem(d => ({ ...d, time: e.target.value }))} />
          </div>
          <div className="rp-field">
            <label className="rp-flabel">Days</label>
            <div className="days-row">
              {days.map((d, i) => (
                <button type="button" key={i}
                  className={`day-btn ${activeDays.includes(i) ? 'active' : ''}`}
                  onClick={() => setActiveDays(ds => ds.includes(i) ? ds.filter(x => x !== i) : [...ds, i])}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="rp-field">
            <label className="rp-flabel">Notes (optional)</label>
            <input className="rp-finput" placeholder="e.g., Take with food"
              value={newRem.notes}
              onChange={e => setNewRem(d => ({ ...d, notes: e.target.value }))} />
          </div>
          <div className="rp-panel-footer">
            <button type="button" className="rp-btn" onClick={() => setPanelOpen(false)}>Cancel</button>
            <button type="submit" className="rp-btn rp-btn-primary">💾 Save Reminder</button>
          </div>
        </form>
      </div>

      {/* Toasts */}
      <div className="rp-toast-wrap">
        {toasts.map(t => <div key={t.id} className="rp-toast-item">{t.msg}</div>)}
      </div>
    </div>
  );
}