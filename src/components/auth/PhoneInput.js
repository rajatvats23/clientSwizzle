// src/components/auth/PhoneInput.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/config';

function PhoneInput() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
        localStorage.setItem(config.storage.pendingTableId, qrCodeIdentifier);
        navigate('/scan');
      } else {
        // If just logged in, go to profile
        navigate('/profile');
      }
    }
  }, [authToken, activeSession, navigate, qrCodeIdentifier]);

  const validatePhone = (phoneNumber) => {
    const errors = {};
    
    if (!phoneNumber.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validatePhone(phone);
    setFormErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format phone number - remove spaces
      const formattedPhone = phone.replace(/\s/g, '');
      
      // Check if phone starts with +, if not add country code
      const phoneWithCode = formattedPhone.startsWith('+') 
        ? formattedPhone 
        : `+91${formattedPhone}`; // Default to India country code
      
      const response = await sendOTP(phoneWithCode);
      
      if (response.status === 'success') {
        // Store table ID from URL if present
        if (qrCodeIdentifier) {
          localStorage.setItem(config.storage.pendingTableId, qrCodeIdentifier);
        }
        
        // Show OTP for development if available
        if (response.data && response.data.otp && config.isDevelopment) {
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
            onChange={(e) => {
              setPhone(e.target.value);
              if (formErrors.phone) {
                // Clear error when user types
                setFormErrors({...formErrors, phone: undefined});
              }
            }}
            placeholder="+919876543210"
            required
            className={formErrors.phone ? 'error' : ''}
          />
          {formErrors.phone && (
            <div className="error-message">{formErrors.phone}</div>
          )}
          <small className="helper-text">Enter your phone number with country code</small>
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}

export default PhoneInput;