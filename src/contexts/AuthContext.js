// src/contexts/AuthContext.js - FIXED VERSION FOR 401 ERRORS
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem(config.storage.authToken) || null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [isLocalEnvironment, setIsLocalEnvironment] = useState(false);
  // This flag prevents automatic redirects during the authentication process
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Set up Axios default base URL
  useEffect(() => {
    axios.defaults.baseURL = config.API_BASE_URL;
    
    // Add a response interceptor to handle 401 errors
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Only handle 401 if we're not actively authenticating
        if (error.response && error.response.status === 401 && !isAuthenticating) {
          console.log('401 error detected, logging out');
          logout();
          // Only redirect to login if not in login process
          if (window.location.pathname !== '/' && window.location.pathname !== '/verify-otp') {
            toast.error('Your session has expired. Please login again.');
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          }
        }
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticating]);

  // Update axios headers whenever token changes
  useEffect(() => {
    if (authToken) {
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      // Fetch profile only if we're not in the authentication process
      if (!isAuthenticating) {
        fetchProfile();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setCustomer(null);
      setActiveSession(null);
      setLoading(false);
    }
    
    // Check if we're on localhost 
    setIsLocalEnvironment(config.isLocalhost());
  }, [authToken, isAuthenticating]);

  // Fetch user profile with error handling
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching profile with token:', authToken);
      
      const response = await axios.get('/customer/profile');
      
      if (response.data.status === 'success') {
        setCustomer(response.data.data.customer);
        
        // Check if customer has active session
        if (response.data.data.sessionInfo) {
          setActiveSession(response.data.data.sessionInfo);
        } else {
          setActiveSession(null);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response && error.response.status === 401) {
        // Don't logout here - the interceptor will handle it
      }
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Send OTP
  const sendOTP = async (phoneNumber) => {
    try {
      setIsAuthenticating(true); // Start auth process
      const response = await axios.post('/customer/send-otp', { phoneNumber });
      setPhoneNumber(phoneNumber);
      
      // Store OTP in localStorage for development auto-fill
      if (config.isDevelopment && response.data.data && response.data.data.otp) {
        localStorage.setItem(config.storage.devOtp, response.data.data.otp);
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  };

  // Verify OTP - improved with better token handling
  const verifyOTP = async (otp) => {
    try {
      setIsAuthenticating(true); // Maintain auth process flag
      console.log('Verifying OTP for', phoneNumber);
      
      const response = await axios.post('/customer/verify-otp', { 
        phoneNumber, 
        otp 
      });
      
      if (response.data.status === 'success' && response.data.data.token) {
        const token = response.data.data.token;
        
        // Set token in state and localStorage
        localStorage.setItem(config.storage.authToken, token);
        setAuthToken(token);
        
        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch profile immediately after setting token
        await fetchProfile();
        
        // Complete authentication process
        setTimeout(() => {
          setIsAuthenticating(false);
        }, 1000);
      }
      
      return response.data;
    } catch (error) {
      setIsAuthenticating(false); // Reset flag on error
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  };

  // Update profile
  const updateProfile = async (name) => {
    try {
      const response = await axios.put('/customer/profile', { name });
      
      if (response.data.status === 'success') {
        setCustomer(prev => ({
          ...prev,
          name
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  };

  // Scan table QR code
  const scanTable = async (qrCodeIdentifier) => {
    try {
      // Clear any pending table ID 
      localStorage.removeItem(config.storage.pendingTableId);
      
      const response = await axios.post(`/customer/scan-table/${qrCodeIdentifier}`);
      
      if (response.data.status === 'success') {
        setActiveSession({
          restaurant: response.data.data.restaurant,
          table: response.data.data.table,
          startTime: response.data.data.session.startTime,
          active: true
        });
      }
      
      return response.data;
    } catch (error) {
      localStorage.removeItem(config.storage.pendingTableId);
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  };

  // Checkout from table
  const checkout = async () => {
    try {
      const response = await axios.post('/customer/checkout');
      
      if (response.data.status === 'success') {
        setActiveSession(null);
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  };

  // Logout - improved to clean up state
  const logout = useCallback(() => {
    localStorage.removeItem(config.storage.authToken);
    delete axios.defaults.headers.common['Authorization'];
    setAuthToken(null);
    setCustomer(null);
    setActiveSession(null);
    // Clear other session data
    localStorage.removeItem(config.storage.pendingTableId);
    localStorage.removeItem(config.storage.devOtp);
  }, []);

  const value = {
    authToken,
    customer,
    loading,
    phoneNumber,
    activeSession,
    isLocalEnvironment,
    isAuthenticating,
    sendOTP,
    verifyOTP,
    updateProfile,
    scanTable,
    checkout,
    logout,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}