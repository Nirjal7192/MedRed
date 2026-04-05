import { useState } from "react";  
import Navbar from "../components/Navbar";
import DnaStrip from "../components/DnaStrip";
import { AlarmClockCheck, CircleUser, MapPinHouse, Hospital, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";

const MOCK_USER = {
  fname: 'John', lname: 'Doe', email: 'john.doe@example.com',
  mobile: '+91 9876543210', gender: 'Male', birthDate: '1990-05-15',
  bloodGroup: 'O+', street: '123 Main Street', city: 'Mumbai',
  state: 'Maharashtra', pincode: '400001', country: 'India',
  emergencyContact: 'Jane Doe', emergencyPhone: '+91 9876543211',
  allergies: 'None', conditions: 'Hypertension, Type 2 Diabetes',
  primaryDoctor: 'Dr. Sharma', hospital: 'City Hospital',
};

const MOCK_REMINDERS = [
  { id: 1, medicineName: 'Metformin', dosage: '500mg', time: '08:00' },
  { id: 2, medicineName: 'Lisinopril', dosage: '10mg',  time: '13:00' },
  { id: 3, medicineName: 'Atorvastatin', dosage: '20mg', time: '22:00' },
];

export default function DashboardPage() {
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState(MOCK_USER);
  const [editData, setEditData] = useState(MOCK_USER);
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [doneChips, setDoneChips] = useState({});
  const [toasts, setToasts] = useState([]);

  function showToast(msg) {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  function startEdit() { setEditData(userData); setEditing(true); }
  function cancelEdit() { setEditing(false); }
  function saveEdit() {
    setUserData(editData); setEditing(false);
    fetch('/api/update_profile', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    }).catch(() => {});
    showToast('✓ Profile updated successfully');
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
            ? <input type={type} className="row-input" value={editData[field] || ''}
                onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))} />
            : <div className="row-display">{userData[field] || '—'}</div>}
        </div>
      </div>
    );
  }

  const initials = ((userData.fname?.[0] || '') + (userData.lname?.[0] || '')).toUpperCase();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar user={userData} />
      <div className="blob blob-1" /><div className="blob blob-2" />

      <main className="dash-main" style={{ position: 'relative', zIndex: 1 }}>
        <div className="dash-inner">
          {/* Header */}
          <div className="dash-top">
            <div>
              <div className="dash-title">
                Welcome back, <span style={{ color: 'var(--primary)' }}>{userData.fname}</span>
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
                <InfoRow label="Full Name"   field="fname" />
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
                <InfoRow label="Name"    field="emergencyContact" />
                <InfoRow label="Phone"   field="emergencyPhone" type="tel" />
                <InfoRow label="Allergies"  field="allergies" />
                <InfoRow label="Conditions" field="conditions" />
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
                    <div className="rem-row" key={r.id}>
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
                            className={`rem-chip ${doneChips[`${r.id}-${lbl}`] ? 'done' : ''}`}
                            onClick={() => toggleChip(r.id, lbl)}
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
