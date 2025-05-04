// src/components/auth/OtpVerification.js - Replace with:

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authToken, verifyOTP, phoneNumber, activeSession, scanTable } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    // Auto-populate OTP in development mode if available
    // This checks for the OTP in localStorage, which we'll set during sendOTP
    const devOtp = localStorage.getItem('dev_otp');
    if (process.env.NODE_ENV === 'development' && devOtp) {
      setOtp(devOtp);
      // Optionally auto-submit after a delay
      // setTimeout(() => handleSubmit(new Event('submit')), 1000);
    }
  }, []);

  useEffect(() => {
    // If no phone number, go back to phone input
    if (!phoneNumber) {
      navigate('/');
      return;
    }

    // If already authenticated with active session, go to table
    if (authToken && activeSession) {
      navigate('/table-session');
    }
  }, [authToken, phoneNumber, activeSession, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyOTP(otp);

      if (response.status === 'success') {
        toast.success('OTP verified successfully');

        // Check if there's a pending table ID and scan it automatically
        const pendingTableId = localStorage.getItem('pendingTableId');
        if (pendingTableId) {
          try {
            const scanResponse = await scanTable(pendingTableId);
            if (scanResponse.status === 'success') {
              localStorage.removeItem('pendingTableId');
              navigate('/table-session');
              return;
            }
          } catch (error) {
            toast.error('Failed to connect to table. Please try again.');
          }
        }

        // If no table ID or scanning failed, go to profile
        navigate('/profile');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Verify OTP</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">Enter OTP sent to {phoneNumber}</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength="6"
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <button
        className="back-button"
        onClick={() => navigate('/')}
        disabled={isLoading}
      >
        Back
      </button>
    </div>
  );
}


export default OtpVerification;