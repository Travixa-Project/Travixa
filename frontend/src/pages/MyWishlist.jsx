import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { packageApi, enquiryApi } from '../api/axiosConfig';
import { useAuth } from '../auth/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageHelper';
import { FaHeart, FaTrashAlt, FaPaperPlane, FaClock, FaTag, FaRupeeSign, FaCommentDots } from 'react-icons/fa';

export default function MyWishlist() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [packagesMap, setPackagesMap] = useState({});
  const [enquiriesMap, setEnquiriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Enquiry Modal State
  const [activeEnquiryPackage, setActiveEnquiryPackage] = useState(null);
  const [subject, setSubject] = useState('Package Enquiry');
  const [message, setMessage] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    loadWishlistAndEnquiries();
  }, []);

  const loadWishlistAndEnquiries = async () => {
    setLoading(true);
    try {
      // 1. Fetch Wishlist Items
      const wishRes = await enquiryApi.get('/wishlist/my');
      const items = wishRes.data || [];
      setWishlistItems(items);

      // 2. Fetch Packages for each wishlist item
      const pkgMap = {};
      await Promise.all(
        items.map(async (item) => {
          try {
            const pRes = await packageApi.get(`/packages/${item.packageId}`);
            pkgMap[item.packageId] = pRes.data;
          } catch {
            pkgMap[item.packageId] = null;
          }
        })
      );
      setPackagesMap(pkgMap);

      // 3. Fetch Customer's Enquiries
      try {
        const enqRes = await enquiryApi.get('/enquiries/my');
        const eMap = {};
        (enqRes.data || []).forEach(e => {
          if (e.packageId) {
            eMap[e.packageId] = e;
          }
        });
        setEnquiriesMap(eMap);
      } catch {
        setEnquiriesMap({});
      }

    } catch {
      setErr('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (packageId) => {
    setMsg(''); setErr('');
    try {
      await enquiryApi.delete(`/wishlist/${packageId}`);
      setMsg('Package removed from your Wishlist.');
      loadWishlistAndEnquiries();
    } catch {
      setErr('Failed to remove package from Wishlist.');
    }
  };

  const openEnquiryModal = (pkg) => {
    setActiveEnquiryPackage(pkg);
    setSubject(`Enquiry for ${pkg.title}`);
    setMessage('');
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!activeEnquiryPackage) return;
    setSubmittingEnquiry(true);
    setMsg(''); setErr('');

    try {
      await enquiryApi.post('/enquiries', {
        packageId: activeEnquiryPackage.id,
        packageTitle: activeEnquiryPackage.title,
        subject: subject,
        message: message
      });
      setMsg(`Enquiry submitted for ${activeEnquiryPackage.title}! Admin will respond soon.`);
      setActiveEnquiryPackage(null);
      setMessage('');
      loadWishlistAndEnquiries();
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to send enquiry.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ANSWERED' || status === 'REPLIED') {
      return <span className="badge badge-success">ANSWERED</span>;
    }
    if (status === 'CLOSED') {
      return <span className="badge badge-cancelled">CLOSED</span>;
    }
    return <span className="badge badge-pending">PENDING</span>;
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaHeart style={{ color: '#EF4444' }} />
        My Wishlist
      </h1>

      {msg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{msg}</div>}
      {err && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{err}</div>}

      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <h3>Your Wishlist is empty</h3>
          <p>Browse our tour packages and click "♡ Add to Wishlist" to save your favorite tours!</p>
          <Link to="/packages" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse Packages →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {wishlistItems.map((item) => {
            const pkg = packagesMap[item.packageId];
            if (!pkg) return null;

            const existingEnquiry = enquiriesMap[pkg.id];
            const imgSrc = getImageUrl(pkg.imageUrl);

            return (
              <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>

                  {/* Left Column: Package Overview */}
                  <div style={{ display: 'flex', gap: '16px', padding: '16px', flex: 1, alignItems: 'center' }}>
                    <img
                      src={imgSrc}
                      alt={pkg.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PLACEHOLDER_IMAGE; }}
                      style={{ width: '130px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                    />

                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>
                        {pkg.title}
                      </h3>

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock style={{ color: 'var(--primary)' }} /> {pkg.durationDays}D/{pkg.durationNights}N
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaTag style={{ color: 'var(--primary)' }} /> {pkg.category ? pkg.category.replace('_', ' ') : 'General'}
                        </span>
                      </div>

                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                        <FaRupeeSign style={{ fontSize: '14px' }} />{Number(pkg.price).toLocaleString()}
                        <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--gray-500)', marginLeft: '4px' }}>/ person</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div style={{ padding: '16px', background: '#F8FAFC', borderLeft: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link to={`/packages/${pkg.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                        View Details
                      </Link>

                      <button
                        onClick={() => removeFromWishlist(pkg.id)}
                        className="btn btn-danger btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FaTrashAlt /> Remove
                      </button>
                    </div>

                    <button
                      onClick={() => openEnquiryModal(pkg)}
                      className="btn btn-primary btn-sm btn-block"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaPaperPlane /> Send Enquiry
                    </button>
                  </div>
                </div>

                {/* Enquiry Status & Response Section */}
                {existingEnquiry && (
                  <div style={{ borderTop: '1px solid var(--gray-200)', background: '#F0F9FF', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCommentDots style={{ color: 'var(--primary)' }} />
                        Enquiry Status
                      </span>
                      {getStatusBadge(existingEnquiry.status)}
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid #BAE6FD', fontSize: '13px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Question:</strong> {existingEnquiry.subject}
                      </div>
                      <div style={{ color: 'var(--gray-700)', marginBottom: '8px' }}>
                        "{existingEnquiry.message}"
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginBottom: '6px' }}>
                        Sent on {formatDate(existingEnquiry.createdAt)}
                      </div>

                      {/* Admin Reply Display */}
                      {existingEnquiry.adminReply ? (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E0F2FE', background: '#F0FDF4', padding: '10px', borderRadius: 'var(--radius)' }}>
                          <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>
                            Admin Reply:
                          </strong>
                          <div style={{ color: '#15803D', fontWeight: 500 }}>
                            "{existingEnquiry.adminReply}"
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontStyle: 'italic', marginTop: '6px' }}>
                          Awaiting reply from Travixa Admin...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Send Enquiry Modal */}
      {activeEnquiryPackage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaPaperPlane style={{ color: 'var(--primary)' }} />
              Send Enquiry
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
              Package: <strong>{activeEnquiryPackage.title}</strong>
            </p>

            <form onSubmit={handleEnquirySubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Airport pickup inquiry, hotel upgrade..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ask any question regarding itinerary, pickup, hotel upgrades, meals..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveEnquiryPackage(null)}
                  className="btn btn-secondary"
                  disabled={submittingEnquiry}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingEnquiry}
                >
                  {submittingEnquiry ? 'Sending...' : 'Send Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
