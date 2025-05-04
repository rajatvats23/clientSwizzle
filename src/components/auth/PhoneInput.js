import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function PhoneInput({ pendingTableId }) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authToken, sendOTP, activeSession } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  
  // Check if there's a QR code in the URL parameters
  const qrCodeIdentifier = params.qrCodeIdentifier;

  useEffect(() => {
    // If user is already authenticated, redirect to profile or table session
    if (authToken) {
      if (activeSession) {
        navigate('/table-session');
      } else if (qrCodeIdentifier || pendingTableId) {
        // If there's a QR code in the URL, scan it directly
        navigate('/scan');
      } else {
        navigate('/profile');
      }
    }
  }, [authToken, activeSession, navigate, qrCodeIdentifier, pendingTableId]);

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
        // Store pending table ID if present
        if (qrCodeIdentifier) {
          localStorage.setItem('pendingTableId', qrCodeIdentifier);
        } else if (pendingTableId) {
          localStorage.setItem('pendingTableId', pendingTableId);
        }
        
        // If response contains OTP (for development), show it in a toast
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
      <h1>Restaurant Customer App</h1>
      
      {(qrCodeIdentifier || pendingTableId) && (
        <div className="message success">
          Please login to access table {qrCodeIdentifier || pendingTableId}
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