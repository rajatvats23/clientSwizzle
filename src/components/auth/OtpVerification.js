import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authToken, verifyOTP, phoneNumber, activeSession } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If no phone number, go back to phone input
    if (!phoneNumber) {
      navigate('/');
      return;
    }
    
    // If already authenticated, redirect appropriately
    if (authToken) {
      const pendingTableId = localStorage.getItem('pendingTableId');
      
      if (activeSession) {
        navigate('/table-session');
      } else if (pendingTableId) {
        navigate('/scan');
      } else {
        navigate('/profile');
      }
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
        
        // Check if there's a pending table to scan
        const pendingTableId = localStorage.getItem('pendingTableId');
        if (pendingTableId) {
          navigate('/scan');
        } else {
          navigate('/profile');
        }
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