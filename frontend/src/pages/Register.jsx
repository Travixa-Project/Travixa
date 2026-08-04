import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../api/axiosConfig';
import { getErrorMessage } from '../utils/errorHelper';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Requirement 3: Password match validation before API call
    if (form.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Send registration payload to backend
      const res = await authApi.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password
      });

      login(res.data);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--secondary)' }}>Create Account</h2>
        
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vivek Patil"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="e.g. vivek@gmail.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--gray-500)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  fontSize: '16px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field with Show/Hide Toggle */}
          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--gray-500)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  fontSize: '16px'
                }}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
