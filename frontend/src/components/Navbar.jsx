import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <img
            src="/travixa-logo.png"
            alt="Travixa Logo"
            className="navbar-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span>Travixa</span>
        </Link>

        <div className="navbar-links">
          {isAdmin() ? (
            <>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/packages" className={({ isActive }) => (isActive ? 'active' : '')}>
                Packages
              </NavLink>
              <NavLink to="/admin/bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
                Bookings
              </NavLink>
              <NavLink to="/admin/payments" className={({ isActive }) => (isActive ? 'active' : '')}>
                Payments
              </NavLink>
              <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? 'active' : '')}>
                Customers
              </NavLink>
              <NavLink to="/admin/enquiries" className={({ isActive }) => (isActive ? 'active' : '')}>
                Enquiries
              </NavLink>
              <NavLink to="/admin/reviews" className={({ isActive }) => (isActive ? 'active' : '')}>
                Reviews
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
              <NavLink to="/packages" className={({ isActive }) => (isActive ? 'active' : '')}>
                Packages
              </NavLink>
              {isLoggedIn() && (
                <>
                  <NavLink to="/my-bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
                    My Bookings
                  </NavLink>
                  <NavLink to="/my-wishlist" className={({ isActive }) => (isActive ? 'active' : '')}>
                    My Wishlist
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isLoggedIn() ? (
            <>
              <span className="navbar-user">{user?.email}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
