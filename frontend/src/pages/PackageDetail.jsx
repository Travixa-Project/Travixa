import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { packageApi, bookingApi, paymentApi, reviewApi, enquiryApi } from '../api/axiosConfig';
import { useAuth } from '../auth/AuthContext';
import { loadRazorpayScript } from '../utils/razorpayLoader';
import { formatDate } from '../utils/dateFormatter';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageHelper';
import { getErrorMessage } from '../utils/errorHelper';
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaClock,
  FaUsers,
  FaRupeeSign,
  FaTag,
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaCreditCard,
  FaCheckDouble,
  FaHeart,
  FaRegHeart
} from 'react-icons/fa';

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isCustomer } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wishlist State
  const [isSavedInWishlist, setIsSavedInWishlist] = useState(false);

  // Booking & Payment State
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookErr, setBookErr] = useState('');

  // Booking Success State
  const [successData, setSuccessData] = useState(null);

  // Review State for Logged in Customer
  const [userBookingForPackage, setUserBookingForPackage] = useState(null);
  const [existingUserReview, setExistingUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewModalErr, setReviewModalErr] = useState('');

  useEffect(() => {
    loadPackageDetails();
  }, [id]);

  const loadPackageDetails = () => {
    setLoading(true);
    Promise.all([
      packageApi.get(`/packages/${id}`),
      reviewApi.get(`/reviews/package/${id}`),
      reviewApi.get(`/reviews/package/${id}/rating`)
    ]).then(([pkgRes, revRes, ratRes]) => {
      setPkg(pkgRes.data);
      setReviews(revRes.data || []);
      setRating(ratRes.data);

      if (isLoggedIn() && isCustomer()) {
        // Fetch user's reviews for this package
        reviewApi.get('/reviews/my').then(rRes => {
          const activeUserReviews = (rRes.data || []).filter(r => r.packageId === Number(id) && r.status === 'ACTIVE');
          const activeReviewForPkg = activeUserReviews[0] || null;

          setExistingUserReview(activeReviewForPkg);
          if (activeReviewForPkg) {
            setReviewRating(activeReviewForPkg.rating || 5);
            setReviewText(activeReviewForPkg.reviewText || '');
          } else {
            setReviewRating(5);
            setReviewText('');
          }

          // Fetch user's bookings to check eligibility
          bookingApi.get('/bookings/my').then(bRes => {
            const validBookings = (bRes.data || []).filter(b => 
              b.packageId === Number(id) && (b.status === 'CONFIRMED' || b.status === 'COMPLETED')
            );

            if (activeReviewForPkg) {
              const bForRev = validBookings.find(b => b.id === activeReviewForPkg.bookingId) || validBookings[0];
              setUserBookingForPackage(bForRev || null);
            } else {
              const reviewedBookingIds = new Set((rRes.data || []).filter(r => r.status === 'ACTIVE').map(r => r.bookingId));
              const unreviewedBooking = validBookings.find(b => !reviewedBookingIds.has(b.id));
              setUserBookingForPackage(unreviewedBooking || null);
            }
          }).catch(() => {});
        }).catch(() => {});

        // Fetch user's wishlist
        enquiryApi.get('/wishlist/my').then(wRes => {
          const isWish = (wRes.data || []).some(w => w.packageId === Number(id));
          setIsSavedInWishlist(isWish);
        }).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const toggleWishlist = async () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    try {
      if (isSavedInWishlist) {
        await enquiryApi.delete(`/wishlist/${id}`);
        setIsSavedInWishlist(false);
      } else {
        await enquiryApi.post(`/wishlist/${id}`);
        setIsSavedInWishlist(true);
      }
    } catch {}
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookErr('');
    setSuccessData(null);

    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    // Validation: Available seats check
    if (pkg.availableSlots != null && numberOfPersons > pkg.availableSlots) {
      setBookErr(`Not enough available seats. Only ${pkg.availableSlots} seat(s) remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      // Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setBookErr('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
        setSubmitting(false);
        return;
      }

      // 1. Create Booking (Status: PENDING_PAYMENT)
      const totalAmount = pkg.price * numberOfPersons;
      const bookingRes = await bookingApi.post('/bookings', {
        packageId: pkg.id,
        packageTitle: pkg.title,
        travelDate: pkg.startDate || null,
        numberOfPersons: numberOfPersons,
        totalAmount: totalAmount,
        specialRequests: specialRequests
      });

      const booking = bookingRes.data;

      // 2. Create Razorpay Order in Backend
      const orderRes = await paymentApi.post(`/payments/create-order?bookingId=${booking.id}&amount=${totalAmount}`);
      const orderData = orderRes.data;

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId || "rzp_test_TKmAC2UpFqpQYP",
        amount: orderData.amountInPaise,
        currency: orderData.currency || "INR",
        name: "Travixa Tours",
        description: `Payment for ${pkg.title}`,
        image: "/travixa-logo.png",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify Payment Signature in Backend
            await paymentApi.post('/payments/verify', {
              bookingId: booking.id,
              packageId: pkg.id,
              numberOfPersons: numberOfPersons,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            // Display Booking Success Confirmation
            setSuccessData({
              bookingId: booking.id,
              packageTitle: pkg.title,
              amountPaid: totalAmount,
              paymentId: response.razorpay_payment_id,
              transactionDate: formatDate(new Date())
            });

            setSpecialRequests('');
            setNumberOfPersons(1);
            loadPackageDetails();
          } catch (err) {
            setBookErr(getErrorMessage(err, 'Payment signature verification failed.'));
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@travixa.com',
          contact: '9876543210'
        },
        notes: {
          bookingId: booking.id
        },
        theme: {
          color: "#2563EB"
        },
        modal: {
          ondismiss: function () {
            setBookErr('Payment modal closed. Your booking has been created in PENDING_PAYMENT status. You can pay anytime from My Bookings.');
            setSubmitting(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setBookErr(`Payment Failed: ${response.error.description || 'Transaction declined'}. Your booking remains in PENDING_PAYMENT status.`);
        setSubmitting(false);
      });
      razorpayInstance.open();

    } catch (err) {
      setBookErr(getErrorMessage(err, 'Booking creation failed. Please try again.'));
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewModalErr('');
    setReviewMsg('');

    // Requirement 8: Validate rating & review comment
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewModalErr('Rating must be between 1 and 5 stars.');
      return;
    }

    const trimmedText = reviewText ? reviewText.trim() : '';
    if (!trimmedText || trimmedText.length < 10) {
      setReviewModalErr('Review comment must be at least 10 characters long.');
      return;
    }

    if (trimmedText.length > 500) {
      setReviewModalErr('Review comment cannot exceed 500 characters.');
      return;
    }

    if (!existingUserReview && !userBookingForPackage) {
      setReviewModalErr('You can only review a package that you have a confirmed and paid booking for.');
      return;
    }

    setSubmittingReview(true);

    try {
      if (existingUserReview) {
        // Update review
        await reviewApi.put(`/reviews/${existingUserReview.reviewId}`, {
          rating: reviewRating,
          reviewText: trimmedText
        });
        setReviewMsg('Your review has been updated successfully!');
      } else {
        // Create review
        await reviewApi.post('/reviews', {
          bookingId: userBookingForPackage.id,
          packageId: pkg.id,
          rating: reviewRating,
          reviewText: trimmedText
        });
        setReviewMsg('Your review has been published successfully!');
      }
      setShowReviewModal(false);
      loadPackageDetails();
    } catch (err) {
      setReviewModalErr(getErrorMessage(err, 'Failed to submit review.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (r) => {
    const fullStars = Math.round(r || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} style={{ color: i < fullStars ? '#F59E0B' : '#E2E8F0', marginRight: '2px' }} />
    ));
  };

  const parseDestinations = (destText) => {
    if (!destText) return [];
    return destText.split(/[\n,]/).map(d => d.trim()).filter(Boolean);
  };

  if (loading) return <div className="spinner"></div>;
  if (!pkg) return <div className="empty-state"><h3>Package not found</h3></div>;

  const destinationsList = parseDestinations(pkg.destinationsCovered);
  const departureDateDisplay = pkg.startDate ? formatDate(pkg.startDate) : 'To Be Announced';
  const returnDateDisplay = pkg.endDate ? formatDate(pkg.endDate) : 'To Be Announced';
  const totalPayable = pkg.price * numberOfPersons;
  const imgSrc = getImageUrl(pkg.imageUrl);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '20px' }}>
        ← Back to Packages
      </button>

      {/* Package Header Image / Banner */}
      <div style={{
        height: '280px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '24px',
        position: 'relative'
      }}>
        <img
          src={imgSrc}
          alt={pkg.title}
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PLACEHOLDER_IMAGE; }}
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--secondary)' }}>
            {pkg.title}
          </h1>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', fontSize: '14px', color: 'var(--gray-600)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FaTag style={{ color: 'var(--primary)' }} />
              Category: <strong>{pkg.category ? pkg.category.replace('_', ' ') : 'General'}</strong>
            </span>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FaCheckCircle style={{ color: pkg.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' }} />
              Status: <span className={`badge badge-${pkg.status.toLowerCase()}`}>{pkg.status}</span>
            </span>

            {rating && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {renderStars(rating.averageRating)}
                <strong>{rating.averageRating}</strong> ({rating.totalReviews} review{rating.totalReviews === 1 ? '' : 's'})
              </span>
            )}
          </div>
        </div>

        {/* Wishlist Button on Package Detail page */}
        <button
          onClick={toggleWishlist}
          className={`btn ${isSavedInWishlist ? 'btn-secondary' : 'btn-primary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '15px' }}
        >
          {isSavedInWishlist ? <FaHeart style={{ color: '#EF4444' }} /> : <FaRegHeart />}
          {isSavedInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
        </button>
      </div>

      {/* Key Package Information Grid */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--gray-800)' }}>
          Tour Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FaCalendarAlt style={{ color: 'var(--primary)', marginTop: '3px', fontSize: '16px' }} />
            <div>
              <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>Departure Date</span><br />
              <strong>{departureDateDisplay}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FaCalendarCheck style={{ color: 'var(--primary)', marginTop: '3px', fontSize: '16px' }} />
            <div>
              <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>Return Date</span><br />
              <strong>{returnDateDisplay}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FaClock style={{ color: 'var(--primary)', marginTop: '3px', fontSize: '16px' }} />
            <div>
              <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>Duration</span><br />
              <strong>{pkg.durationDays} Days / {pkg.durationNights} Nights</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FaUsers style={{ color: 'var(--primary)', marginTop: '3px', fontSize: '16px' }} />
            <div>
              <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>Available Seats</span><br />
              <strong>{pkg.availableSlots} Seats</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FaRupeeSign style={{ color: 'var(--primary)', marginTop: '3px', fontSize: '16px' }} />
            <div>
              <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>Price Per Person</span><br />
              <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>₹{Number(pkg.price).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Covered Section */}
      {destinationsList.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMapMarkerAlt style={{ color: 'var(--primary)' }} />
            Destinations Covered
          </h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {destinationsList.map((dest, idx) => (
              <li key={idx} style={{ fontSize: '14px', color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '16px' }}>•</span> {dest}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Description Section */}
      {pkg.description && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--gray-800)' }}>Description</h3>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.7' }}>{pkg.description}</p>
        </div>
      )}

      {/* Highlights Section */}
      {pkg.highlights && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--gray-800)' }}>Highlights</h3>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', whiteSpace: 'pre-line', lineHeight: '1.7' }}>{pkg.highlights}</p>
        </div>
      )}

      {/* Inclusions & Exclusions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {pkg.inclusions && (
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--success)' }}>Inclusions</h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', whiteSpace: 'pre-line', lineHeight: '1.7' }}>{pkg.inclusions}</p>
          </div>
        )}
        {pkg.exclusions && (
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--danger)' }}>Exclusions</h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', whiteSpace: 'pre-line', lineHeight: '1.7' }}>{pkg.exclusions}</p>
          </div>
        )}
      </div>

      {/* Booking Confirmation / Razorpay Section */}
      {successData ? (
        <div className="card" style={{ marginBottom: '32px', border: '2px solid var(--success)', background: '#F0FDF4', textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '12px' }}>
            <FaCheckDouble />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
            Payment Successful!
          </h2>
          <p style={{ fontSize: '16px', color: '#15803D', fontWeight: 600, marginBottom: '20px' }}>
            Booking Confirmed
          </p>

          <div style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: 'var(--radius)', padding: '20px', maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left', fontSize: '14px' }}>
            <div style={{ marginBottom: '8px' }}><strong>Booking ID:</strong> #{successData.bookingId}</div>
            <div style={{ marginBottom: '8px' }}><strong>Package Name:</strong> {successData.packageTitle}</div>
            <div style={{ marginBottom: '8px' }}><strong>Amount Paid:</strong> ₹{Number(successData.amountPaid).toLocaleString()}</div>
            <div style={{ marginBottom: '8px' }}><strong>Payment ID:</strong> {successData.paymentId}</div>
            <div style={{ marginBottom: '8px' }}><strong>Transaction Date:</strong> {successData.transactionDate}</div>
            <div><strong>Status:</strong> <span className="badge badge-confirmed">CONFIRMED</span></div>
          </div>

          <Link to="/my-bookings" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 600 }}>
            View My Bookings →
          </Link>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '32px', border: '2px solid var(--primary-light)', background: '#F8FAFC' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCreditCard style={{ color: 'var(--primary)' }} />
            Book & Pay with Razorpay
          </h2>

          {bookErr && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{bookErr}</div>}

          <form onSubmit={handleBookingSubmit}>
            <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600 }}>Price Per Person</label>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', padding: '10px 0' }}>
                  ₹{Number(pkg.price).toLocaleString()}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600 }}>Number of Travellers *</label>
                <input
                  type="number"
                  min={1}
                  max={pkg.availableSlots || 50}
                  required
                  value={numberOfPersons}
                  onChange={e => setNumberOfPersons(Math.max(1, Number(e.target.value)))}
                  style={{ fontSize: '15px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600 }}>Special Requests (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Dietary preferences, room preferences..."
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
              />
            </div>

            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-200)',
              padding: '16px',
              borderRadius: 'var(--radius)',
              marginBottom: '20px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Total Payable Amount</span>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  ₹{totalPayable.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                ({numberOfPersons} traveller{numberOfPersons > 1 ? 's' : ''} × ₹{Number(pkg.price).toLocaleString()})
              </div>
            </div>

            {isLoggedIn() && isCustomer() ? (
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting || (pkg.availableSlots != null && pkg.availableSlots <= 0)}
                style={{ padding: '14px 24px', fontSize: '16px', fontWeight: 700 }}
              >
                {submitting ? 'Opening Razorpay Checkout...' : pkg.availableSlots != null && pkg.availableSlots <= 0 ? 'Sold Out' : 'Proceed to Payment (Razorpay)'}
              </button>
            ) : !isLoggedIn() ? (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-block"
                style={{ padding: '14px 24px', fontSize: '16px', fontWeight: 700 }}
              >
                Login to Book & Pay
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>
                Logged in as Admin (Switch to a customer account to place bookings)
              </div>
            )}
          </form>
        </div>
      )}

      {/* Customer Reviews Section */}
      <section style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FaStar style={{ color: '#F59E0B' }} />
              Customer Reviews ({reviews.length})
            </h2>
            {rating && (
              <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '4px' }}>
                Average Rating: <strong>{rating.averageRating} / 5</strong> ({rating.totalReviews} review{rating.totalReviews === 1 ? '' : 's'})
              </div>
            )}
          </div>

          {/* Review Action / Eligibility Status */}
          {isLoggedIn() && isCustomer() && (
            <div>
              {existingUserReview ? (
                <button
                  onClick={() => { setReviewModalErr(''); setShowReviewModal(true); }}
                  className="btn btn-secondary"
                >
                  Edit Review
                </button>
              ) : userBookingForPackage ? (
                <button
                  onClick={() => { setReviewModalErr(''); setShowReviewModal(true); }}
                  className="btn btn-primary"
                >
                  Write Review
                </button>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '6px 12px', borderRadius: 'var(--radius)' }}>
                  Only customers with a confirmed & paid booking can review.
                </span>
              )}
            </div>
          )}
        </div>

        {reviewMsg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{reviewMsg}</div>}

        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map(r => (
              <div key={r.reviewId} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--secondary)' }}>
                      {r.customerName || `Customer #${r.customerId}`}
                    </strong>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {renderStars(r.rating)}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                {r.reviewText && <p style={{ fontSize: '14px', color: 'var(--gray-700)', margin: 0, lineHeight: '1.6' }}>{r.reviewText}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No reviews yet</h3>
            <p>Be the first to review after completing your tour!</p>
          </div>
        )}
      </section>

      {/* Write / Edit Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--secondary)' }}>
              {existingUserReview ? 'Edit Your Review' : 'Write a Review'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
              Feedback for <strong>{pkg.title}</strong>
            </p>

            {reviewModalErr && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                {reviewModalErr}
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Your Rating (1 to 5 Stars) *</label>
                <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '24px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      style={{ color: star <= reviewRating ? '#F59E0B' : '#E2E8F0' }}
                      onClick={() => setReviewRating(star)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Review Comment (10 - 500 characters) *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  maxLength={500}
                  placeholder="Share details of your experience (minimum 10 characters)..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)' }}
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                  {reviewText ? reviewText.trim().length : 0} / 500 characters
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-secondary"
                  disabled={submittingReview}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : existingUserReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
