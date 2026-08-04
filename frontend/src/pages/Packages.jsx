import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { packageApi, enquiryApi } from '../api/axiosConfig';
import { useAuth } from '../auth/AuthContext';
import { FaClock, FaTag, FaUsers, FaRupeeSign, FaHeart, FaRegHeart } from 'react-icons/fa';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageHelper';

const DEFAULT_CATEGORIES = [
  { value: 'ADVENTURE', label: 'Adventure' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'HONEYMOON', label: 'Honeymoon' },
  { value: 'RELIGIOUS', label: 'Religious' },
  { value: 'BEACH', label: 'Beach' },
  { value: 'WILDLIFE', label: 'Wildlife' },
  { value: 'HILL_STATION', label: 'Hill Station' },
  { value: 'DOMESTIC', label: 'Domestic' },
  { value: 'INTERNATIONAL', label: 'International' }
];

export default function Packages() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [wishlistSet, setWishlistSet] = useState(new Set());

  useEffect(() => {
    packageApi.get('/packages/categories')
      .then(r => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setCategories(r.data.map(cat => ({
            value: cat,
            label: cat.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
          })));
        }
      })
      .catch(() => {});
    loadPackages();
    loadWishlist();
  }, []);

  const loadPackages = (keyword, cat) => {
    setLoading(true);
    const params = {};
    if (keyword) params.keyword = keyword;
    if (cat) params.category = cat;
    packageApi.get('/packages/search', { params })
      .then(r => setPackages(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadWishlist = () => {
    if (!isLoggedIn()) return;
    enquiryApi.get('/wishlist/my')
      .then(r => {
        const setIds = new Set((r.data || []).map(w => w.packageId));
        setWishlistSet(setIds);
      })
      .catch(() => {});
  };

  const toggleWishlist = async (e, packageId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    try {
      if (wishlistSet.has(packageId)) {
        await enquiryApi.delete(`/wishlist/${packageId}`);
        setWishlistSet(prev => {
          const next = new Set(prev);
          next.delete(packageId);
          return next;
        });
      } else {
        await enquiryApi.post(`/wishlist/${packageId}`);
        setWishlistSet(prev => new Set(prev).add(packageId));
      }
    } catch {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPackages(search, category);
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Tour Packages</h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input placeholder="Search packages..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '14px' }} />
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '14px' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? <div className="spinner"></div> : (
        packages.length > 0 ? (
          <div className="grid-3">
            {packages.map(pkg => {
              const imgSrc = getImageUrl(pkg.imageUrl);
              const isSaved = wishlistSet.has(pkg.id);

              return (
                <div key={pkg.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Wishlist Heart Icon Badge */}
                  <button
                    onClick={(e) => toggleWishlist(e, pkg.id)}
                    title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                    style={{
                      position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                      background: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '50%',
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'transform 0.2s'
                    }}
                  >
                    {isSaved ? <FaHeart style={{ color: '#EF4444', fontSize: '18px' }} /> : <FaRegHeart style={{ color: '#64748B', fontSize: '18px' }} />}
                  </button>

                  <img
                    src={imgSrc}
                    alt={pkg.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PLACEHOLDER_IMAGE; }}
                    style={{ height: '180px', width: '100%', objectFit: 'cover', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }}
                  />
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--secondary)' }}>{pkg.title}</h3>

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock style={{ color: 'var(--primary)' }} /> {pkg.durationDays}D/{pkg.durationNights}N
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaTag style={{ color: 'var(--primary)' }} /> {pkg.category ? pkg.category.replace('_', ' ') : 'General'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaUsers style={{ color: 'var(--primary)' }} /> {pkg.availableSlots} seats left
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                          <FaRupeeSign style={{ fontSize: '14px' }} />{Number(pkg.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Link to={`/packages/${pkg.id}`} className="btn btn-secondary btn-block btn-sm" style={{ textAlign: 'center' }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state"><h3>No packages found</h3></div>
      )}
    </div>
  );
}
