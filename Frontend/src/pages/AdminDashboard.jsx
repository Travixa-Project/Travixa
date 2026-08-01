import React, { useEffect, useState } from 'react'
import { getDashboardStats } from '../services/adminService'
import { toast } from 'react-toastify'
import { Link } from 'react-router'

function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        setLoading(true)
        try {
            const res = await getDashboardStats()
            if (res.data && res.data.status === 'success') {
                setStats(res.data.data)
            } else {
                toast.error(res.data?.error || 'Failed to load dashboard stats')
            }
        } catch (err) {
            toast.error('Failed to load admin stats')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="text-center my-5 py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4 text-dark">Admin Analytics Dashboard</h2>

            {/* Stat Cards Row */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 bg-primary text-white rounded-3">
                        <span className="text-white-50 small fw-bold text-uppercase">Total Revenue</span>
                        <h2 className="fw-bold my-1">${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}</h2>
                        <small className="opacity-75">From confirmed bookings</small>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 bg-success text-white rounded-3">
                        <span className="text-white-50 small fw-bold text-uppercase">Total Bookings</span>
                        <h2 className="fw-bold my-1">{stats?.totalBookings || 0}</h2>
                        <small className="opacity-75">Customer reservations</small>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 bg-info text-white rounded-3">
                        <span className="text-white-50 small fw-bold text-uppercase">Tour Packages</span>
                        <h2 className="fw-bold my-1">{stats?.totalPackages || 0}</h2>
                        <small className="opacity-75">Active & archived tours</small>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm p-3 bg-warning text-dark rounded-3">
                        <span className="text-dark-50 small fw-bold text-uppercase">Open Enquiries</span>
                        <h2 className="fw-bold my-1">{stats?.openEnquiries || 0}</h2>
                        <small className="text-dark opacity-75">Awaiting admin reply</small>
                    </div>
                </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="d-flex gap-2 flex-wrap mb-4">
                <Link to="/home/manage-packages" className="btn btn-outline-primary fw-semibold">+ Add New Package</Link>
                <Link to="/home/manage-bookings" className="btn btn-outline-success fw-semibold">View All Bookings</Link>
                <Link to="/home/manage-enquiries" className="btn btn-outline-warning fw-semibold">Manage Enquiries</Link>
                <Link to="/home/manage-coupons" className="btn btn-outline-danger fw-semibold">Manage Coupons</Link>
            </div>

            {/* Recent Activity Tables */}
            <div className="row g-4">
                {/* Recent Bookings */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-3">Recent Bookings</h5>
                        {!stats?.recentBookings || stats.recentBookings.length === 0 ? (
                            <p className="text-muted small">No recent bookings recorded.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Ref #</th>
                                            <th>Customer</th>
                                            <th>Package</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentBookings.map(b => (
                                            <tr key={b.id}>
                                                <td className="fw-bold small">{b.bookingNumber}</td>
                                                <td>{b.customerName}</td>
                                                <td className="text-truncate" style={{ maxWidth: '150px' }}>{b.packageName}</td>
                                                <td className="fw-bold text-success">${b.finalPrice}</td>
                                                <td>
                                                    <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                        {b.bookingStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Enquiries */}
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-3">Recent Customer Enquiries</h5>
                        {!stats?.recentEnquiries || stats.recentEnquiries.length === 0 ? (
                            <p className="text-muted small">No recent enquiries.</p>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {stats.recentEnquiries.map(eq => (
                                    <div key={eq.id} className="border-bottom pb-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong className="small text-dark">{eq.name}</strong>
                                            <span className={`badge ${eq.status === 'RESOLVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {eq.status}
                                            </span>
                                        </div>
                                        <small className="text-muted d-block text-truncate">{eq.subject}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
