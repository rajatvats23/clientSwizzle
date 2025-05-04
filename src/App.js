import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components with correct casing
import PhoneInput from './components/auth/PhoneInput';
import OtpVerification from './components/auth/OtpVerification';
import Profile from './components/profile/Profile';
import QrScanner from './components/table/QrScanner';
import TableSession from './components/table/TableSession';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './App.css';

function App() {
  const [pendingTableId, setPendingTableId] = useState(null);

  // Check for table ID in URL on initial load
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    
    if (pathParts.length > 2 && pathParts[1] === 'table') {
      setPendingTableId(pathParts[2]);
    } else {
      // Check for query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const tableId = urlParams.get('table');
      if (tableId) {
        setPendingTableId(tableId);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <ToastContainer position="top-center" />
            <Routes>
              <Route path="/" element={<PhoneInput pendingTableId={pendingTableId} />} />
              <Route path="/verify-otp" element={<OtpVerification pendingTableId={pendingTableId} />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/scan" element={<QrScanner />} />
              <Route path="/table-session" element={<TableSession />} />
              <Route path="/table/:qrCodeIdentifier" element={<PhoneInput />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;