import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function UserFormPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: 'male',
    dob: '', bloodGroup: '', height: '', weight: '',
    street: '', city: '', state: '', pincode: '', country: 'India',
    emergencyName: '', emergencyPhone: '', relationship: '',
    allergies: '', conditions: '', medications: '', notes: '',
    doctorName: '', doctorPhone: '', hospitalName: '',
  });

  function update(field) {
    return e => setForm(d => ({ ...d, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    try {
      await authApi.updateUser({
        mobileNumber:   form.phone,
        pinCode:        form.pincode,
        streetAddress:  form.street,
        city:           form.city,
        state:          form.state,
        country:        form.country,
        gender:         form.gender,
        birthDate:      form.dob,
        bloodGroup:     form.bloodGroup,
        medicalConditions: form.conditions,
        allergies:      form.allergies,
      });
      // Update auth context with form data so Dashboard shows it
      updateUser({
        mobileNumber:     form.phone,
        pinCode:          form.pincode,
        streetAddress:    form.street,
        city:             form.city,
        state:            form.state,
        country:          form.country,
        gender:           form.gender,
        birthDate:        form.dob,
        bloodGroup:       form.bloodGroup,
        medicalConditions: form.conditions,
        allergies:        form.allergies,
      });
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); navigate('/dashboard'); }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to save profile. Please try again.');
    }
  }

  return (
    <div className="uf-page" style={{ position: 'relative' }}>
      <div className="blob blob-1" /><div className="blob blob-2" />
      <Navbar user={user} />

      <main className="uf-main" style={{ position: 'relative', zIndex: 1 }}>
        <div className="uf-container">
          <div className="uf-card">
            <div className="uf-title">Complete Your Profile</div>
            <div className="uf-subtitle">Help us personalize your MedRed experience by filling in your health information.</div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Personal */}
              <div className="uf-section-title">Personal Information</div>
              <div className="uf-grid">
                <div className="uf-field"><label>First Name</label>
                  <input className="uf-input" placeholder="John" value={form.firstName} onChange={update('firstName')} />
                </div>
                <div className="uf-field"><label>Last Name</label>
                  <input className="uf-input" placeholder="Doe" value={form.lastName} onChange={update('lastName')} />
                </div>
                <div className="uf-field"><label>Email Address</label>
                  <input className="uf-input" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
                </div>
                <div className="uf-field"><label>Phone Number</label>
                  <input className="uf-input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={update('phone')} />
                </div>
                <div className="uf-field"><label>Date of Birth</label>
                  <input className="uf-input" type="date" value={form.dob} onChange={update('dob')} />
                </div>
                <div className="uf-field"><label>Blood Group</label>
                  <select className="uf-input uf-select" value={form.bloodGroup} onChange={update('bloodGroup')}>
                    <option value="">Select blood group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="uf-field" style={{ gridColumn: '1/-1' }}>
                  <label>Gender</label>
                  <div className="uf-radio-group">
                    {['male','female','other'].map(g => (
                      <label key={g} className="uf-radio">
                        <input type="radio" name="gender" value={g} checked={form.gender === g}
                          onChange={() => setForm(d => ({ ...d, gender: g }))} />
                        <span style={{ color: '#e0e0e0', fontWeight: 500, cursor: 'pointer' }}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="uf-section-title">Address</div>
              <div className="uf-grid">
                <div className="uf-field" style={{ gridColumn: '1/-1' }}><label>Street Address</label>
                  <input className="uf-input" placeholder="123 Main Street" value={form.street} onChange={update('street')} />
                </div>
                <div className="uf-field"><label>City</label>
                  <input className="uf-input" placeholder="Mumbai" value={form.city} onChange={update('city')} />
                </div>
                <div className="uf-field"><label>State</label>
                  <input className="uf-input" placeholder="Maharashtra" value={form.state} onChange={update('state')} />
                </div>
                <div className="uf-field"><label>PIN / ZIP Code</label>
                  <input className="uf-input" placeholder="400001" value={form.pincode} onChange={update('pincode')} />
                </div>
                <div className="uf-field"><label>Country</label>
                  <input className="uf-input" placeholder="India" value={form.country} onChange={update('country')} />
                </div>
              </div>

              {/* Emergency */}
              <div className="uf-section-title">Emergency Contact</div>
              <div className="uf-grid">
                <div className="uf-field"><label>Contact Name</label>
                  <input className="uf-input" placeholder="Jane Doe" value={form.emergencyName} onChange={update('emergencyName')} />
                </div>
                <div className="uf-field"><label>Contact Phone</label>
                  <input className="uf-input" type="tel" placeholder="+91 9876543211" value={form.emergencyPhone} onChange={update('emergencyPhone')} />
                </div>
                <div className="uf-field"><label>Relationship</label>
                  <select className="uf-input uf-select" value={form.relationship} onChange={update('relationship')}>
                    <option value="">Select relationship</option>
                    {['Spouse','Parent','Sibling','Child','Friend','Other'].map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Medical */}
              <div className="uf-section-title">Medical Information</div>
              <div className="uf-grid">
                <div className="uf-field" style={{ gridColumn: '1/-1' }}><label>Known Allergies</label>
                  <textarea className="uf-input uf-textarea" placeholder="List any known allergies..." value={form.allergies} onChange={update('allergies')} />
                </div>
                <div className="uf-field" style={{ gridColumn: '1/-1' }}><label>Existing Medical Conditions</label>
                  <textarea className="uf-input uf-textarea" placeholder="e.g., Hypertension, Diabetes..." value={form.conditions} onChange={update('conditions')} />
                </div>
                <div className="uf-field"><label>Primary Doctor</label>
                  <input className="uf-input" placeholder="Dr. Smith" value={form.doctorName} onChange={update('doctorName')} />
                </div>
                <div className="uf-field"><label>Hospital / Clinic</label>
                  <input className="uf-input" placeholder="City Hospital" value={form.hospitalName} onChange={update('hospitalName')} />
                </div>
              </div>

              {submitError && (
                <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>
                  ✗ {submitError}
                </div>
              )}
              <div className="uf-btn-group">
                <button type="button" className="uf-btn-secondary" onClick={() => navigate('/dashboard')}>Skip for Now</button>
                <button type="submit" className="uf-btn-primary">
                  <i className="fas fa-save" /> Save Information
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <div className={`uf-success ${showSuccess ? 'show' : ''}`}>
        ✓ Profile saved! Redirecting to dashboard...
      </div>
    </div>
  );
}
