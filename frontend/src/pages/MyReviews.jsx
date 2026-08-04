import { useEffect, useState } from 'react';
import { reviewApi } from '../api/axiosConfig';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, reviewText: '' });

  useEffect(() => { load(); }, []);
  const load = () => {
    setLoading(true);
    reviewApi.get('/reviews/my').then(r => setReviews(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const startEdit = (r) => {
    setEditId(r.reviewId);
    setEditForm({ rating: r.rating, reviewText: r.reviewText || '' });
  };

  const saveEdit = async () => {
    await reviewApi.put(`/reviews/${editId}`, editForm);
    setEditId(null);
    load();
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await reviewApi.delete(`/reviews/${id}`);
    load();
  };

  const renderStars = (r) => '★'.repeat(r) + '☆'.repeat(5 - r);

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>My Reviews</h1>
      {reviews.length === 0 ? <div className="empty-state"><h3>No reviews yet</h3><p>Book and complete a tour, then leave your review!</p></div> : (
        reviews.map(r => (
          <div key={r.reviewId} className="card" style={{ marginBottom: '12px' }}>
            {editId === r.reviewId ? (
              <div>
                <div className="form-group">
                  <label>Rating</label>
                  <select value={editForm.rating} onChange={e => setEditForm({...editForm, rating: Number(e.target.value)})}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Review</label>
                  <textarea value={editForm.reviewText} onChange={e => setEditForm({...editForm, reviewText: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={saveEdit} className="btn btn-primary btn-sm">Save</button>
                  <button onClick={() => setEditId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="stars stars-sm">{renderStars(r.rating)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Package #{r.packageId} • {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.reviewText && <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '12px' }}>{r.reviewText}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(r)} className="btn btn-secondary btn-sm">Edit</button>
                  <button onClick={() => deleteReview(r.reviewId)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
