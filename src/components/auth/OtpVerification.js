// src/components/auth/OtpVerification.js - Improved with better auth flow
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/config';

function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const { authToken, verifyOTP, phoneNumber, activeSession, scanTable, sendOTP } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Set up resend countdown
  useEffect(() => {
    // Start with 30 seconds
    setResendCountdown(30);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set up timer to count down
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-populate OTP in development mode if available
    const devOtp = localStorage.getItem(config.storage.devOtp);
    if (config.isDevelopment && devOtp) {
      setOtp(devOtp);
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
      // Verify OTP - this will set the token and update auth state
      const response = await verifyOTP(otp);

      if (response.status === 'success') {
        toast.success('OTP verified successfully');
        console.log('OTP verification successful, checking for pending table');

        // Check if there's a pending table ID to scan
        const pendingTableId = localStorage.getItem(config.storage.pendingTableId);
        
        // Add a small delay to ensure token is properly set in axios headers
        setTimeout(async () => {
          if (pendingTableId) {
            try {
              console.log('Scanning pending table:', pendingTableId);
              const scanResponse = await scanTable(pendingTableId);
              
              if (scanResponse.status === 'success') {
                localStorage.removeItem(config.storage.pendingTableId);
                navigate('/table-session');
                return;
              }
            } catch (error) {
              console.error('Table scan error:', error);
              toast.error('Failed to connect to table. Please try again.');
            }
          }

          // If no table ID or scanning failed, go to profile after a delay
          // This delay helps ensure the auth state is fully updated
          setTimeout(() => {
            console.log('Redirecting to profile page');
            navigate('/profile');
          }, 500);
        }, 1000);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Failed to verify OTP');
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0 || !phoneNumber) return;
    
    try {
      setIsLoading(true);
      const response = await sendOTP(phoneNumber);
      
      if (response.status === 'success') {
        toast.success('OTP resent successfully');
        
        // Show OTP for development if available
        if (response.data && response.data.otp && config.isDevelopment) {
          toast.info(`Development OTP: ${response.data.otp}`);
          localStorage.setItem(config.storage.devOtp, response.data.otp);
        }
        
        // Reset countdown
        setResendCountdown(30);
        
        // Restart timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        timerRef.current = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone number for display
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    
    // If phone is longer than 10 digits and contains country code
    if (phone.length > 10) {
      // For displaying, assume last 10 digits are the actual number
      const countryCode = phone.slice(0, phone.length - 10);
      const number = phone.slice(phone.length - 10);
      
      // Format as +XX XXXXX XXXXX
      return `${countryCode} ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    
    // Just format as XXXXX XXXXX
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  };

  return (
    <div className="container">
      <h1>Verify OTP</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">Enter OTP sent to {formatPhoneForDisplay(phoneNumber)}</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength="6"
            required
            autoComplete="one-time-code"
          />
          <small className="helper-text">Enter the 6-digit OTP sent to your phone</small>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <p className="resend-text">
          {resendCountdown > 0 ? (
            `Resend OTP in ${resendCountdown} seconds`
          ) : (
            <button 
              type="button" 
              className="resend-button"
              onClick={handleResendOTP}
              disabled={isLoading}
            >
              Resend OTP
            </button>
          )}
        </p>
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