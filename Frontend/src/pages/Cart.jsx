import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { emptyCartAction } from '../slices/CartSlice'
import { createBooking } from '../services/bookingService'
import { validateCoupon } from '../services/couponService'
import { getInvoiceDownloadUrl } from '../services/invoiceService'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router'

function Cart() {
    const cartItems = useSelector(store => store.CartSlice.cartItems)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [travelDate, setTravelDate] = useState(
        new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
    )
    const [passengers, setPassengers] = useState([
        { fullName: '', age: 25, gender: 'Male', passportNumber: '' }
    ])

    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')
    const [bookingSuccessRef, setBookingSuccessRef] = useState(null)

    const selectedPkg = cartItems.length > 0 ? cartItems[0] : null
    const basePrice = selectedPkg ? selectedPkg.price : 0
    const subtotal = basePrice * passengers.length

    useEffect(() => {
        if (appliedCoupon) {
            const disc = subtotal * (appliedCoupon.discountPercentage / 100)
            setDiscountAmount(disc)
        } else {
            setDiscountAmount(0)
        }
    }, [subtotal, appliedCoupon])

    const handleAddPassenger = () => {
        setPassengers([...passengers, { fullName: '', age: 25, gender: 'Male', passportNumber: '' }])
    }

    const handleRemovePassenger = (idx) => {
        if (passengers.length === 1) {
            toast.warn('At least 1 passenger is required')
            return
        }
        const updated = passengers.filter((_, i) => i !== idx)
        setPassengers(updated)
    }

    const handlePassengerChange = (idx, field, val) => {
        const updated = [...passengers]
        updated[idx][field] = val
        setPassengers(updated)
    }

    const handleApplyCoupon = async () => {
        if (!couponCode) return
        try {
            const res = await validateCoupon(couponCode.trim())
            if (res.data && res.data.status === 'success') {
                const coupon = res.data.data
                if (subtotal < coupon.minBookingAmount) {
                    toast.warn(`Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon.`)
                    return
                }
                setAppliedCoupon(coupon)
                toast.success(`Coupon ${coupon.code} applied! ${coupon.discountPercentage}% OFF`)
            } else {
                toast.error(res.data?.error || 'Invalid coupon code')
            }
        } catch (err) {
            toast.error('Failed to validate coupon')
        }
    }

    const handlePlaceBooking = async () => {
        if (!selectedPkg) {
            toast.error('No package selected in cart')
            return
        }

        for (let i = 0; i < passengers.length; i++) {
            if (!passengers[i].fullName.trim()) {
                toast.error(`Please enter full name for Passenger ${i + 1}`)
                return
            }
        }

        try {
            const payload = {
                packageId: selectedPkg.fid || selectedPkg.id,
                travelDate,
                passengers,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                paymentMethod
            }

            const res = await createBooking(payload)
            if (res.data && res.data.status === 'success') {
                const booking = res.data.data
                toast.success(`Booking Confirmed! Reference: ${booking.bookingNumber}`)
                setBookingSuccessRef(booking.bookingNumber)
                dispatch(emptyCartAction())
            } else {
                toast.error(res.data?.error || 'Booking failed')
            }
        } catch (err) {
            console.error(err)
            toast.error('Booking failed. Please try again.')
        }
    }

    if (bookingSuccessRef) {
        return (
            <div className="container py-5 text-center">
                <div className="card shadow border-0 p-5 mx-auto rounded-4" style={{ maxWidth: '600px' }}>
                    <div className="text-success display-1 mb-3">✓</div>
                    <h2 className="fw-bold text-dark mb-2">Booking Confirmed!</h2>
                    <p className="text-muted">Your tour booking has been placed successfully.</p>
                    <div className="bg-light p-3 rounded mb-4">
                        <span className="text-muted small d-block">Booking Reference Number</span>
                        <strong className="fs-4 text-primary">{bookingSuccessRef}</strong>
                    </div>
                    <div className="d-flex gap-3 justify-content-center">
                        <a
                            href={getInvoiceDownloadUrl(bookingSuccessRef)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-danger btn-lg fw-bold"
                        >
                            📄 Download PDF Invoice
                        </a>
                        <button className="btn btn-outline-primary btn-lg fw-bold" onClick={() => navigate('/home/order')}>
                            View My Bookings
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!selectedPkg) {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: '500px' }}>
                    <h4 className="fw-bold text-dark mb-3">Your Selection is Empty</h4>
                    <p className="text-muted">Browse tour packages and click "Book" to customize your travel package.</p>
                    <button className="btn btn-primary mt-2" onClick={() => navigate('/home')}>Browse Packages</button>
                </div>
            </div>
        )
    }

    const finalTotal = Math.max(0, subtotal - discountAmount)

    return (
        <div className='container py-4'>
            <h2 className="fw-bold mb-4 text-dark">Checkout & Customize Booking</h2>

            <div className='row g-4'>
                {/* Left Side: Package & Passenger Form */}
                <div className='col-12 col-lg-8'>
                    {/* Selected Package Summary Card */}
                    <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
                        <div className="d-flex align-items-center gap-3">
                            <img
                                src={selectedPkg.image}
                                alt={selectedPkg.name}
                                className="rounded"
                                style={{ width: '110px', height: '80px', objectFit: 'cover' }}
                            />
                            <div>
                                <h5 className="fw-bold mb-1">{selectedPkg.name}</h5>
                                <p className="text-muted small mb-0">Duration: {selectedPkg.durationDays || 4} Days / {selectedPkg.durationNights || 3} Nights</p>
                                <span className="text-success fw-bold">₹{basePrice} / person</span>
                            </div>
                        </div>
                    </div>

                    {/* Travel Date & Passenger Information */}
                    <div className="card border-0 shadow-sm p-4 mb-4 rounded-3">
                        <h5 className="fw-bold mb-3 border-bottom pb-2">1. Select Travel Date</h5>
                        <div className="mb-4 col-12 col-md-6">
                            <label className="form-label small fw-semibold">Departure Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={travelDate}
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                onChange={e => setTravelDate(e.target.value)}
                            />
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                            <h5 className="fw-bold mb-0">2. Passenger Details ({passengers.length})</h5>
                            <button className="btn btn-outline-primary btn-sm fw-semibold" onClick={handleAddPassenger}>
                                + Add Passenger
                            </button>
                        </div>

                        {passengers.map((p, idx) => (
                            <div key={idx} className="bg-light p-3 rounded mb-3 border">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-bold small text-primary">Passenger #{idx + 1}</span>
                                    {passengers.length > 1 && (
                                        <button className="btn btn-sm text-danger" onClick={() => handleRemovePassenger(idx)}>Remove</button>
                                    )}
                                </div>
                                <div className="row g-2">
                                    <div className="col-12 col-md-5">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Full Name"
                                            value={p.fullName}
                                            onChange={e => handlePassengerChange(idx, 'fullName', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            placeholder="Age"
                                            value={p.age}
                                            onChange={e => handlePassengerChange(idx, 'age', parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <select
                                            className="form-select form-select-sm"
                                            value={p.gender}
                                            onChange={e => handlePassengerChange(idx, 'gender', e.target.value)}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="card border-0 shadow-sm p-4 rounded-3">
                        <h5 className="fw-bold mb-3 border-bottom pb-2">3. Payment Option</h5>
                        <div className="d-flex gap-3 flex-wrap">
                            {['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING'].map(pm => (
                                <div key={pm} className={`border rounded p-3 cursor-pointer flex-fill text-center ${paymentMethod === pm ? 'border-primary bg-primary bg-opacity-10 fw-bold' : ''}`}
                                    onClick={() => setPaymentMethod(pm)}>
                                    <span>{pm.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Bill Summary */}
                <div className='col-12 col-lg-4'>
                    <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '90px' }}>
                        <h4 className="fw-bold mb-3 border-bottom pb-2">Bill Summary</h4>

                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Package Price</span>
                            <span>₹{basePrice}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Passengers</span>
                            <span>x {passengers.length}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 fw-semibold">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2 text-success fw-bold">
                                <span>Coupon Discount</span>
                                <span>-₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <hr />

                        <div className="d-flex justify-content-between mb-4 fs-5 fw-bold text-dark">
                            <span>Total Payable</span>
                            <span className="text-success">₹{finalTotal.toFixed(2)}</span>
                        </div>

                        {/* Coupon Code input */}
                        <div className="mb-4">
                            <label className="form-label small fw-semibold">Have a Coupon Code?</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control text-uppercase"
                                    placeholder="e.g. WELCOME10"
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                />
                                <button className="btn btn-outline-secondary fw-semibold" onClick={handleApplyCoupon}>
                                    Apply
                                </button>
                            </div>
                            <small className="text-muted d-block mt-1">Try WELCOME10 or SUMMER20</small>
                        </div>

                        <button className="btn btn-success btn-lg w-100 fw-bold shadow-sm" onClick={handlePlaceBooking}>
                            Confirm & Pay ₹{finalTotal.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
