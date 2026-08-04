import { useEffect, useState } from 'react';
import { enquiryApi } from '../api/axiosConfig';
import { useAuth } from '../auth/AuthContext';

export default function MyEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', message: '', userName: '', userEmail: '' });
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setForm(f => ({ ...f, userName: user?.email || '', userEmail: user?.email || '' }));
    load();
  }, []);

  const load = () => {
    setLoading(true);
    enquiryApi.get('/enquiries/my').then(r => setEnquiries(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const submit = async (e) => {
    e.preventDefault();
    await enquiryApi.post('/enquiries', form);
    setShowForm(false);
    setForm({ ...form, subject: '', message: '' });
    load();
  };

  const badge = (s) => {
    const m = { OPEN: 'badge-open', REPLIED: 'badge-replied', CLOSED: 'badge-closed' };
    return m[s] || '';
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>My Enquiries</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">{showForm ? 'Close' : '+ New Enquiry'}</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Submit Enquiry</h3>
          <form onSubmit={submit}>
            <div className="form-group"><label>Your Name</label><input required value={form.userName} onChange={e => setForm({...form, userName: e.target.value})} /></div>
            <div className="form-group"><label>Your Email</label><input type="email" required value={form.userEmail} onChange={e => setForm({...form, userEmail: e.target.value})} /></div>
            <div className="form-group"><label>Subject</label><input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
            <div className="form-group"><label>Message</label><textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      )}

      {enquiries.length === 0 ? <div className="empty-state"><h3>No enquiries yet</h3></div> : (
        enquiries.map(e => (
          <div key={e.id} className="card" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px' }}>{e.subject}</h3>
              <span className={`badge ${badge(e.status)}`}>{e.status}</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>{e.message}</p>
            {e.adminReply && (
              <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: 'var(--radius)', fontSize: '14px' }}>
                <strong>Admin Reply:</strong> {e.adminReply}
              </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '8px' }}>{new Date(e.createdAt).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}
