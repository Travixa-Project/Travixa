import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { addToCartAction } from '../slices/CartSlice'
import { addToWishlist } from '../services/wishlistService'
import { toast } from 'react-toastify'

function PackageCard({ pkg }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [wishlisted, setWishlisted] = useState(false)

    if (!pkg) return null

    const primaryImg = (pkg.images && pkg.images.length > 0)
        ? pkg.images.find(img => img.isPrimary)?.imageUrl || pkg.images[0].imageUrl
        : pkg.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'

    const discountedPrice = pkg.discountPercentage > 0
        ? (pkg.price * (1 - pkg.discountPercentage / 100)).toFixed(2)
        : pkg.price

    const handleWishlistClick = async (e) => {
        e.stopPropagation()
        try {
            const res = await addToWishlist(pkg.id)
            if (res.data && res.data.status === 'success') {
                setWishlisted(true)
                toast.success('Added to wishlist!')
            } else {
                toast.info(res.data?.error || 'Already in wishlist')
            }
        } catch (err) {
            toast.error('Failed to add to wishlist')
        }
    }

    const handleBookNow = () => {
        dispatch(addToCartAction({
            fid: pkg.id,
            id: pkg.id,
            name: pkg.name,
            price: parseFloat(discountedPrice),
            originalPrice: pkg.price,
            image: primaryImg,
            durationDays: pkg.durationDays,
            durationNights: pkg.durationNights,
            qty: 1
        }))
        navigate('/home/cart')
    }

    return (
        <div className='col-12 col-md-6 col-lg-4 mb-4'>
            <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden transition-all hover-shadow">
                <div className="position-relative">
                    <img
                        src={primaryImg}
                        className="card-img-top"
                        alt={pkg.name}
                        style={{ height: "220px", objectFit: "cover" }}
                    />
                    <span className={`position-absolute top-0 start-0 m-3 badge ${pkg.tourType === 'INTERNATIONAL' ? 'bg-primary' : 'bg-success'} fs-7 text-uppercase px-2 py-1`}>
                        {pkg.tourType || 'TOUR'}
                    </span>
                    {pkg.discountPercentage > 0 && (
                        <span className="position-absolute top-0 end-0 m-3 badge bg-danger fs-7 px-2 py-1">
                            {pkg.discountPercentage}% OFF
                        </span>
                    )}
                    <button
                        className="btn btn-light btn-sm position-absolute bottom-0 end-0 m-2 rounded-circle shadow-sm"
                        onClick={handleWishlistClick}
                        title="Add to Wishlist"
                    >
                        <span className={wishlisted ? "text-danger fw-bold" : "text-secondary"}>♥</span>
                    </button>
                </div>

                <div className="card-body d-flex flex-column p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted fw-semibold">
                            {pkg.destinationName || pkg.country || 'Destination'}
                        </small>
                        <span className="badge bg-warning text-dark fw-bold">
                            ★ {pkg.ratingAvg ? pkg.ratingAvg.toFixed(1) : '4.5'}
                        </span>
                    </div>

                    <h5 className="card-title fw-bold text-dark mb-2 text-truncate" title={pkg.name}>
                        {pkg.name}
                    </h5>

                    <p className="card-text text-secondary small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {pkg.description || 'Experience a spectacular guided tour filled with culture, sightseeing, and memories.'}
                    </p>

                    <div className="d-flex align-items-center justify-content-between text-muted small mb-3 border-top pt-2">
                        <span>🕒 {pkg.durationDays}D / {pkg.durationNights}N</span>
                        <span>🪑 {pkg.availableSeats} Seats left</span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
                        <div>
                            <span className="fs-5 fw-bold text-success">₹{discountedPrice}</span>
                            {pkg.discountPercentage > 0 && (
                                <span className="text-muted text-decoration-line-through ms-2 small">₹{pkg.price}</span>
                            )}
                            <small className="text-muted d-block">/ person</small>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-primary btn-sm px-2 fw-semibold"
                                onClick={() => navigate(`/home/package/${pkg.id}`)}
                            >
                                Details
                            </button>
                            <button
                                className="btn btn-success btn-sm px-3 fw-semibold"
                                onClick={handleBookNow}
                            >
                                Book
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PackageCard
