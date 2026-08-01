import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router'
import logo from '../assets/logo.png'
import { UserContext } from '../App'
import { useSelector } from 'react-redux'

function Navbar() {
    const { setLoginStatus, userRole } = useContext(UserContext)
    const cartItems = useSelector(store => store.CartSlice.cartItems)
    const navigate = useNavigate()

    const handleLogoutClick = () => {
        setLoginStatus(false)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/')
    }

    const isAdmin = userRole && (userRole.includes('ROLE_ADMIN') || userRole.includes('ADMIN'))

    return (
        <nav className="navbar navbar-expand-lg bg-dark border-bottom border-body sticky-top" data-bs-theme="dark">
            <div className="container-fluid px-4">
                <Link className="navbar-brand d-flex align-items-center me-4" to={isAdmin ? '/home/admin-dashboard' : '/home'}>
                    <img src={logo} style={{ height: '38px', width: '38px', borderRadius: '8px', objectFit: 'cover' }} alt="Travixa Logo" className="me-2 shadow-sm" />
                    <span className="fw-bold text-white fs-5">Travixa</span>
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav me-auto">
                        {!isAdmin ? (
                            <>
                                <Link className="nav-link px-3" to='/home'>Browse Packages</Link>
                                <Link className="nav-link px-3" to='/home/domestic'>Domestic Tours</Link>
                                <Link className="nav-link px-3" to='/home/international'>International Tours</Link>
                                <Link className="nav-link px-3" to='/home/wishlist'>Wishlist</Link>
                                <Link className="nav-link px-3" to='/home/order'>My Bookings</Link>
                                <Link className="nav-link px-3" to='/home/enquiry'>Contact & Enquiry</Link>
                                {cartItems.length > 0 && (
                                    <Link className="nav-link px-3 text-warning fw-semibold" to='/home/cart'>
                                        Selected Tour ({cartItems.length})
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link className="nav-link px-3" to='/home/admin-dashboard'>Dashboard</Link>
                                <Link className="nav-link px-3" to='/home/manage-packages'>Manage Packages</Link>
                                <Link className="nav-link px-3" to='/home/manage-categories'>Categories & Destinations</Link>
                                <Link className="nav-link px-3" to='/home/manage-bookings'>Bookings</Link>
                                <Link className="nav-link px-3" to='/home/manage-enquiries'>Enquiries</Link>
                                <Link className="nav-link px-3" to='/home/manage-reviews'>Reviews</Link>
                                <Link className="nav-link px-3" to='/home/manage-coupons'>Coupons</Link>
                                <Link className="nav-link px-3" to='/home/manage-users'>Users</Link>
                            </>
                        )}
                    </div>

                    <div className="navbar-nav ms-auto align-items-center">
                        <Link className="nav-link px-3 text-light" to='/home/profile'>
                            <i className="bi bi-person-circle me-1"></i> Profile
                        </Link>
                        <button className="btn btn-outline-danger btn-sm ms-2 px-3 fw-semibold" onClick={handleLogoutClick}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
