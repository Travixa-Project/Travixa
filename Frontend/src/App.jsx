import { Navigate, Route, Routes } from "react-router"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import Packages from "./pages/Packages"
import PackageDetails from "./pages/PackageDetails"
import Cart from "./pages/Cart"
import Order from "./pages/Order"
import Wishlist from "./pages/Wishlist"
import EnquiryPage from "./pages/EnquiryPage"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"
import ManagePackages from "./pages/ManagePackages"
import ManageCategoriesDestinations from "./pages/ManageCategoriesDestinations"
import ManageBookings from "./pages/ManageBookings"
import ManageEnquiries from "./pages/ManageEnquiries"
import ManageReviews from "./pages/ManageReviews"
import ManageCoupons from "./pages/ManageCoupons"
import ManageUsers from "./pages/ManageUsers"
import { createContext, useState, useEffect } from "react"

export const UserContext = createContext()

function App() {
  const [loginStatus, setLoginStatus] = useState(() => {
    return Boolean(sessionStorage.getItem('token') || localStorage.getItem('token'))
  })

  const [userRole, setUserRole] = useState(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'))
      return u?.roles || []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token')
    if (token) {
      setLoginStatus(true)
    }
  }, [])

  return (
    <>
      <UserContext.Provider value={{ loginStatus, setLoginStatus, userRole, setUserRole }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={loginStatus ? <Home /> : <Navigate to='/' />}>
            {/* Customer Routes */}
            <Route path="" element={<Packages />} />
            <Route path="domestic" element={<Packages filterType="DOMESTIC" />} />
            <Route path="international" element={<Packages filterType="INTERNATIONAL" />} />
            <Route path="package/:id" element={<PackageDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="order" element={<Order />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="enquiry" element={<EnquiryPage />} />
            <Route path="profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="admin-dashboard" element={<AdminDashboard />} />
            <Route path="manage-packages" element={<ManagePackages />} />
            <Route path="manage-categories" element={<ManageCategoriesDestinations />} />
            <Route path="manage-bookings" element={<ManageBookings />} />
            <Route path="manage-enquiries" element={<ManageEnquiries />} />
            <Route path="manage-reviews" element={<ManageReviews />} />
            <Route path="manage-coupons" element={<ManageCoupons />} />
            <Route path="manage-users" element={<ManageUsers />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </UserContext.Provider>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
