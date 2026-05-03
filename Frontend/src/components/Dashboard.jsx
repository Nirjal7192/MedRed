import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import DnaStrip from "../components/DnaStrip";
import { AlarmClockCheck, CircleUser, MapPinHouse, Hospital, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user: authUser, setUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [doneChips, setDoneChips] = useState({});
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load user + reminders from API on mount ──
  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, remRes] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/reminders/user', { credentials: 'include' }),
        ]);

        if (userRes.ok) {
          const { user } = await userRes.json();
          // Flatten nested address for easier field mapping
          const flat = {
            fname: user.fname || '',
            lname: user.lname || '',
            email: user.email || '',
            mobile: user.mobileNumber || '',
            gender: user.gender || '',
            birthDate: user.birthDate || '',
            bloodGroup: user.bloodGroup || '',
            street: user.address?.streetAddress || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            pincode: user.address?.pinCode || '',
            country: user.address?.country || '',
            emergencyContact: user.emergencyContactNumber || '',
            emergencyPhone: '',
            allergies: user.allergies || '',
            conditions: user.medicalConditions || '',
            primaryDoctor: '',
            hospital: '',
          };
          setUserData(flat);
          setEditData(flat);
        }

        if (remRes.ok) {
          const { reminders } = await remRes.json();
          setReminders(reminders || []);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function showToast(msg) {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  function startEdit() { setEditData(userData); setEditing(true); }
  function cancelEdit() { setEditing(false); }

  async function saveEdit() {
    try {
      const payload = {
        mobileNumber: editData.mobile,
        birthDate: editData.birthDate,
        gender: editData.gender,
        bloodGroup: editData.bloodGroup,
        allergies: editData.allergies,
        medicalConditions: editData.conditions,
        streetAddress: editData.street,
        city: editData.city,
        state: editData.state,
        pinCode: editData.pincode,
        country: editData.country,
      };
      const r = await fetch('/api/auth/updateUser', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        setUserData(editData);
        setEditing(false);
        showToast('✓ Profile updated successfully');
      } else {
        const d = await r.json();
        showToast(`❌ ${d.detail || 'Update failed'}`);
      }
    } catch {
      showToast('❌ Network error');
    }
  }

  function toggleChip(remId, label) {
    setDoneChips(d => ({ ...d, [`${remId}-${label}`]: !d[`${remId}-${label}`] }));
  }

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${period}`;
  }

  function InfoRow({ label, field, type = 'text' }) {
    return (
      <div className="info-row">
        <div className="row-lbl">{label}</div>
        <div className="row-val">
          {editing
            ? <input type={type} className="row-input" value={editData?.[field] || ''}
                onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))} />
            : <div className="row-display">{userData?.[field] || '—'}</div>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Loading your dashboard...</div>
      </div>
    );
  }

  const initials = ((userData?.fname?.[0] || '') + (userData?.lname?.[0] || '')).toUpperCase() || '?';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar user={userData} />
      <div className="blob blob-1" /><div className="blob blob-2" />

      <main className="dash-main" style={{ position: 'relative', zIndex: 1 }}>
        <div className="dash-inner">
          {/* Header */}
          <div className="dash-top">
            <div>
              <div className="dash-title">
                Welcome back, <span style={{ color: 'var(--primary)' }}>{userData?.fname || authUser?.fname}</span>
              </div>
              <div className="dash-subtitle">Your personalized health overview</div>
            </div>
            <div className="dash-actions">
              {editing ? (
                <>
                  <button className="btn-dark" onClick={cancelEdit}><i className="fas fa-times" /> Cancel</button>
                  <button className="btn-dark btn-dark-primary" onClick={saveEdit}><i className="fas fa-save" /> Save Changes</button>
                </>
              ) : (
                <button className="btn-dark btn-dark-primary" onClick={startEdit}><i className="fas fa-edit" /> Edit Profile</button>
              )}
            </div>
          </div>

          {/* DNA Strip */}
          <div className="dna-strip" aria-hidden="true"><DnaStrip /></div>

          {/* Cards Grid */}
          <div className="cards-grid">
            {/* Personal Info */}
            <div className="info-card">
              <div className="card-hdr">
                <div className="card-ico"><CircleUser /></div>
                <div className="card-ttl">Personal Information</div>
              </div>
              <div className="info-rows">
                <InfoRow label="First Name"  field="fname" />
                <InfoRow label="Mobile"      field="mobile" type="tel" />
                <InfoRow label="Gender"      field="gender" />
                <InfoRow label="Birth Date"  field="birthDate" type="date" />
                <InfoRow label="Blood Group" field="bloodGroup" />
              </div>
            </div>

            {/* Address */}
            <div className="info-card">
              <div className="card-hdr">
                <div className="card-ico"><MapPinHouse /></div>
                <div className="card-ttl">Address</div>
              </div>
              <div className="info-rows">
                <InfoRow label="Street"  field="street" />
                <InfoRow label="City"    field="city" />
                <InfoRow label="State"   field="state" />
                <InfoRow label="Pincode" field="pincode" />
                <InfoRow label="Country" field="country" />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="info-card">
              <div className="card-hdr">
                <div className="card-ico"><PhoneCall /></div>
                <div className="card-ttl">Emergency Contact</div>
              </div>
              <div className="info-rows">
                <InfoRow label="Emergency #"   field="emergencyContact" />
                <InfoRow label="Allergies"     field="allergies" />
                <InfoRow label="Conditions"    field="conditions" />
              </div>
            </div>

            {/* Medical Info */}
            <div className="info-card">
              <div className="card-hdr">
                <div className="card-ico"><Hospital /></div>
                <div className="card-ttl">Medical Information</div>
              </div>
              <div className="info-rows">
                <InfoRow label="Primary Doctor" field="primaryDoctor" />
                <InfoRow label="Hospital"       field="hospital" />
                <InfoRow label="Email"          field="email" type="email" />
              </div>
            </div>

            {/* Reminders */}
            <div className="info-card rem-card-dash">
              <div className="card-hdr">
                <div className="card-ico"><AlarmClockCheck /></div>
                <div className="card-ttl">Today's Reminders</div>
              </div>
              {reminders.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No reminders yet. <Link to="/reminders" style={{ color: 'var(--primary)' }}>Add one →</Link></p>
              ) : (
                <div className="rem-list-dash">
                  {reminders.map(r => (
                    <div className="rem-row" key={r._id}>
                      <div className="rem-time-center">
                        <div className="rem-big">{formatTime(r.time)}</div>
                        <div className="rem-small">Time</div>
                      </div>
                      <div>
                        <div className="rem-name">{r.medicineName}</div>
                        <div className="rem-dose">{r.dosage}</div>
                      </div>
                      <div className="rem-chips">
                        {['Taken', 'Skipped', 'Snoozed'].map(lbl => (
                          <button
                            key={lbl}
                            className={`rem-chip ${doneChips[`${r._id}-${lbl}`] ? 'done' : ''}`}
                            onClick={() => toggleChip(r._id, lbl)}
                          >{lbl}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className="toast-item">{t.msg}</div>)}
      </div>
    </div>
  );
}
