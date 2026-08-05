import { useEffect, useState } from 'react';
import { userApi } from '../api/axiosConfig';
import { useAuth } from '../auth/AuthContext';

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.get('/users/profile').then(r => setProfile(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>My Profile</h1>
      <div className="card">
        {profile ? (
          <div style={{ fontSize: '14px' }}>
            <div style={{ marginBottom: '12px' }}><strong>Full Name:</strong> {profile.fullName}</div>
            <div style={{ marginBottom: '12px' }}><strong>Email:</strong> {profile.email}</div>
            <div style={{ marginBottom: '12px' }}><strong>Phone:</strong> {profile.phone}</div>
            <div><strong>Role:</strong> <span className="badge badge-active">{user?.role}</span></div>
          </div>
        ) : <p style={{ color: 'var(--gray-500)' }}>Profile not available</p>}
      </div>
    </div>
  );
}
