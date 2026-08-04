import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiChatbot from './components/AiChatbot';
import { ProtectedRoute, AdminRoute } from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import MyBookings from './pages/MyBookings';
import MyWishlist from './pages/MyWishlist';
import MyProfile from './pages/MyProfile';

import AdminPackages from './pages/admin/AdminPackages';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminReviews from './pages/admin/AdminReviews';

export default function App() {
  const { isAdmin } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="*"
          element={
            <main className="container page">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/packages" element={isAdmin() ? <Navigate to="/admin/packages" replace /> : <Packages />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/my-wishlist" element={<ProtectedRoute><MyWishlist /></ProtectedRoute>} />
                <Route path="/my-enquiries" element={<Navigate to="/my-wishlist" replace />} />
                <Route path="/my-reviews" element={<Navigate to="/my-bookings" replace />} />
                <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                <Route path="/admin/packages" element={<AdminRoute><AdminPackages /></AdminRoute>} />
                <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
                <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
                <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
                <Route path="/admin/enquiries" element={<AdminRoute><AdminEnquiries /></AdminRoute>} />
                <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
              </Routes>
            </main>
          }
        />
      </Routes>
      <Footer />
      <AiChatbot />
    </>
  );
}
