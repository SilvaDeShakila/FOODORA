import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import { CartProvider } from './contexts/CartContext.js';
import { ToastProvider } from './contexts/ToastContext.js';
import { DemoBar } from './components/DemoBar.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { ScrollToTop } from './components/ScrollToTop.js';
// Pages
import { HomePage } from './pages/HomePage.js';
import { RestaurantsPage } from './pages/RestaurantsPage.js';
import { RestaurantDetailsPage } from './pages/RestaurantDetailsPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage.js';
import { RiderDashboardPage } from './pages/RiderDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { PromotionsPage } from './pages/PromotionsPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

export default function App() {
  return (
    <BrowserRouter>
<ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#0B0F14] text-[#F8FAFC] font-sans selection:bg-[#D4AF37] selection:text-[#0B0F14]">
            {/* Top Demo Tester Bar */}
            <DemoBar />

            {/* Main Header Navbar */}
            <Navbar />

            {/* Sliding Cart Drawer */}
            <CartDrawer />

            {/* Main Application Body */}
            <main className="flex-1">
              <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/promotions" element={<PromotionsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Authenticated Customer Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderTrackingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />

                {/* Role Specific Protected Dashboards */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['restaurant_owner', 'admin']}>
                      <OwnerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rider/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['rider', 'admin']}>
                      <RiderDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
  );
}
