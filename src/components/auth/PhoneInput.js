// src/components/auth/PhoneInput.js - Replace with:

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function PhoneInput() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authToken, sendOTP, activeSession } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  
  // Get table ID from URL parameters
  const qrCodeIdentifier = params.qrCodeIdentifier;

  useEffect(() => {
    // If user is already authenticated, redirect appropriately
    if (authToken) {
      if (activeSession) {
        navigate('/table-session');
      } else if (qrCodeIdentifier) {
        // Store table ID and proceed to scanning
        localStorage.setItem('pendingTableId', qrCodeIdentifier);
        navigate('/scan');
      }
    }
  }, [authToken, activeSession, navigate, qrCodeIdentifier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await sendOTP(phone);
      
      if (response.status === 'success') {
        // Store table ID from URL if present
        if (qrCodeIdentifier) {
          localStorage.setItem('pendingTableId', qrCodeIdentifier);
        }
        
        // Show OTP for development if available
        if (response.data && response.data.otp) {
          toast.info(`Development OTP: ${response.data.otp}`);
        }
        
        navigate('/verify-otp');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Welcome to Restaurant</h1>
      
      {qrCodeIdentifier && (
        <div className="message success">
          Please login to access your table
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="phone">Enter your phone number</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}

export default PhoneInput;