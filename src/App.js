// src/App.js - Optimized version
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import PhoneInput from './components/auth/PhoneInput';
import OtpVerification from './components/auth/OtpVerification';
import TableSession from './components/table/TableSession';
import OrderHistory from './components/table/OrderHistory';
import TableSelection from './components/table/TableSelection';
import Profile from './components/profile/Profile';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <ToastContainer position="top-center" />
            <Routes>
              <Route path="/" element={<PhoneInput />} />
              <Route path="/verify-otp" element={<OtpVerification />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/table-session" element={<TableSession />} />
              <Route path="/table/:qrCodeIdentifier" element={<PhoneInput />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/scan" element={<TableSelection />} />
              <Route path="/select-table" element={<TableSelection />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;