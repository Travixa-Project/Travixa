import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { packageApi } from '../api/axiosConfig';
import { FaClock, FaTag, FaUsers, FaRupeeSign, FaSuitcaseRolling, FaChevronDown } from 'react-icons/fa';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageHelper';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    packageApi.get('/packages/featured')
      .then(res => setFeatured(res.data || []))
      .catch(() => {
        // Fallback to active packages if /featured returns error
        packageApi.get('/packages/active')
          .then(res => setFeatured(res.data || []))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  const scrollToWhyTravixa = () => {
    const el = document.getElementById('why-travixa');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Redesigned Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              ✨ Discover Premium Travel
            </div>
            <h1 className="hero-title">
              Explore Incredible Journeys <br />
              Across India & Beyond
            </h1>
            
            <p className="hero-subtitle">
              Plan your next adventure with secure online booking, verified travel packages, and unforgettable experiences.
            </p>

            <div className="hero-buttons">
              <Link to="/packages" className="btn-hero-primary">
                Explore Packages
              </Link>
              <button onClick={scrollToWhyTravixa} className="btn-hero-secondary">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Animated Scroll Down Indicator */}
        <div className="hero-scroll-indicator" onClick={scrollToWhyTravixa} title="Scroll to Why Choose Travixa">
          <div className="mouse-icon">
            <div className="mouse-wheel"></div>
          </div>
          <FaChevronDown style={{ marginTop: '4px', fontSize: '12px' }} />
        </div>
      </section>

      {/* Why Choose Travixa Section */}
      <section id="why-travixa" className="features-section section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="section-title" style={{ fontSize: '32px', fontWeight: 700 }}>
              Why Choose Travixa
            </h2>
            <p className="section-subtitle" style={{ fontSize: '16px', color: 'var(--gray-600)' }}>
              Experience seamless travel booking with unmatched reliability and support.
            </p>
          </div>

          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card">
              <span className="feature-icon">🧳</span>
              <h3 className="feature-title">Wide Range of Packages</h3>
              <p className="feature-desc">
                Explore domestic and international destinations carefully managed by Travixa.
              </p>
            </div>

            {/* Card 2 */}
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3 className="feature-title">Secure Booking</h3>
              <p className="feature-desc">
                Book confidently with protected authentication and secure online payments.
              </p>
            </div>

            {/* Card 3 */}
            <div className="feature-card">
              <span className="feature-icon">⭐</span>
              <h3 className="feature-title">Verified Reviews</h3>
              <p className="feature-desc">
                Read genuine customer reviews from travellers who completed their trips.
              </p>
            </div>

            {/* Card 4 */}
            <div className="feature-card">
              <span className="feature-icon">💬</span>
              <h3 className="feature-title">Wishlist & Enquiries</h3>
              <p className="feature-desc">
                Save your favourite tours and directly communicate with the travel administrator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="section" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="section-title" style={{ fontSize: '28px', fontWeight: 700 }}>
              Featured Packages
            </h2>
            <p className="section-subtitle">Handpicked tours for an unforgettable experience</p>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : featured.length > 0 ? (
            <div className="grid-3">
              {featured.map(pkg => {
                const imgSrc = getImageUrl(pkg.imageUrl);
                return (
                  <div key={pkg.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <img
                      src={imgSrc}
                      alt={pkg.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PLACEHOLDER_IMAGE; }}
                      style={{ height: '200px', width: '100%', objectFit: 'cover', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }}
                    />
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: 'var(--secondary)' }}>
                          {pkg.title}
                        </h3>

                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaClock style={{ color: 'var(--primary)' }} /> {pkg.durationDays}D / {pkg.durationNights}N
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaTag style={{ color: 'var(--primary)' }} /> {pkg.category ? pkg.category.replace('_', ' ') : 'General'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaUsers style={{ color: 'var(--primary)' }} /> {pkg.availableSlots} seats left
                          </span>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                            <FaRupeeSign style={{ fontSize: '16px' }} />{Number(pkg.price).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Link to={`/packages/${pkg.id}`} className="btn btn-secondary btn-block" style={{ textAlign: 'center', padding: '10px' }}>
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <FaSuitcaseRolling style={{ fontSize: '48px', color: 'var(--gray-400)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '8px' }}>
                No packages available yet
              </h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '16px' }}>
                Check back soon for exciting new tour destinations.
              </p>
              <Link to="/packages" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                Browse All Packages
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
