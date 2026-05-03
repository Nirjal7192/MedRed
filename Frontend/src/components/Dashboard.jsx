import { useState, useEffect } from "react";
// import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import DnaStrip from "../components/DnaStrip";
import { AlarmClockCheck, CircleUser, MapPinHouse, Hospital, PhoneCall } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, remindersApi } from "../services/api";

export default function DashboardPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState(user || {});
  const [editData, setEditData] = useState(user || {});
  const [reminders, setReminders] = useState([]);
  const [doneChips, setDoneChips] = useState({});
  const [toasts, setToasts] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch full user profile from DB on mount
  useEffect(() => {
    authApi.getMe()
      .then(data => {
        if (data.user) {
          const dbUser = {
            ...data.user,
            // Flatten embedded address for easy field access
            streetAddress: data.user.address?.streetAddress || '',
            city: data.user.address?.city || '',
            state: data.user.address?.state || '',
            pinCode: data.user.address?.pinCode || '',
            country: data.user.address?.country || '',
          };
          setUserData(dbUser);
          setEditData(dbUser);
          updateUser(dbUser);
        }
      })
      .catch(() => { }); // silently fallback to AuthContext data
  }, []);

  // Fetch reminders on mount
  useEffect(() => {
    remindersApi.getAll()
      .then(data => setReminders(data.reminders || []))
      .catch(() => setReminders([]))
      .finally(() => setLoadingReminders(false));
  }, []);

  // Keep local userData in sync with auth context
  useEffect(() => {
    if (user) { setUserData(user); setEditData(user); }
  }, [user]);

  function showToast(msg) {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  function startEdit() { setEditData(userData); setEditing(true); }
  function cancelEdit() { setEditing(false); }

  async function saveEdit() {
    setSaveLoading(true);
    try {
      await authApi.updateUser({
        mobileNumber: editData.mobileNumber || editData.mobile || '',
        pinCode: editData.pinCode || editData.pincode || '',
        streetAddress: editData.streetAddress || editData.street || '',
        city: editData.city || '',
        state: editData.state || '',
        country: editData.country || '',
        gender: editData.gender || '',
        birthDate: editData.birthDate || '',
        bloodGroup: editData.bloodGroup || '',
        medicalConditions: editData.conditions || editData.medicalConditions || '',
        allergies: editData.allergies || '',
      });
      const merged = { ...userData, ...editData };
      setUserData(merged);
      updateUser(merged);
      setEditing(false);
      showToast('✓ Profile updated successfully');
    } catch (err) {
      showToast(`✗ ${err.message}`);
    } finally {
      setSaveLoading(false);
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
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
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

  const initials = ((userData.fname?.[0] || '') + (userData.lname?.[0] || '')).toUpperCase() || 'U';

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
                Welcome back, <span style={{ color: 'var(--primary)' }}>{userData.fname || 'User'}</span>
              </div>
              <div className="dash-subtitle">Your personalized health overview</div>
            </div>
            <div className="dash-actions">
              {editing ? (
                <>
                  <button className="btn-dark" onClick={cancelEdit} disabled={saveLoading}>
                    <i className="fas fa-times" /> Cancel
                  </button>
                  <button className="btn-dark btn-dark-primary" onClick={saveEdit} disabled={saveLoading}>
                    {saveLoading ? <><span className="spin-icon" /> Saving...</> : <><i className="fas fa-save" /> Save Changes</>}
                  </button>
                </>
              ) : (
                <button className="btn-dark btn-dark-primary" onClick={startEdit}>
                  <i className="fas fa-edit" /> Edit Profile
                </button>
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
                <InfoRow label="First Name" field="fname" />
                <InfoRow label="Last Name" field="lname" />
                <InfoRow label="Mobile" field="mobileNumber" type="tel" />
                <InfoRow label="Gender" field="gender" />
                <InfoRow label="Birth Date" field="birthDate" type="date" />
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
                <InfoRow label="Street" field="streetAddress" />
                <InfoRow label="City" field="city" />
                <InfoRow label="State" field="state" />
                <InfoRow label="Pincode" field="pinCode" />
                <InfoRow label="Country" field="country" />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="info-card">
              <div className="card-hdr">
                <div className="card-ico"><PhoneCall /></div>
                <div className="card-ttl">Medical Details</div>
              </div>
              <div className="info-rows">
                <InfoRow label="Allergies" field="allergies" />
                <InfoRow label="Conditions" field="medicalConditions" />
                <InfoRow label="Emergency Contact" field="emergencyContactNumber" type="tel" />
              </div>
            </div>

            {/* Medical Info */}
            <div className="info-card">
              <div className="card-hdr">
                <div className="card-ico"><Hospital /></div>
                <div className="card-ttl">Account</div>
              </div>
              <div className="info-rows">
                <InfoRow label="Email" field="email" type="email" />
              </div>
            </div>

            {/* Reminders */}
            <div className="info-card rem-card-dash">
              <div className="card-hdr">
                <div className="card-ico"><AlarmClockCheck /></div>
                <div className="card-ttl">Today's Reminders</div>
              </div>
              {loadingReminders ? (
                <p style={{ color: 'var(--muted)' }}>Loading reminders...</p>
              ) : reminders.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>
                  No reminders yet. <Link to="/reminders" style={{ color: 'var(--primary)' }}>Add one →</Link>
                </p>
              ) : (
                <div className="rem-list-dash">
                  {reminders.map(r => (
                    <div className="rem-row" key={r._id || r.id}>
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
                            className={`rem-chip ${doneChips[`${r._id || r.id}-${lbl}`] ? 'done' : ''}`}
                            onClick={() => toggleChip(r._id || r.id, lbl)}
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
