import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeSession, setActiveSession] = useState(null);

  // Set up Axios default base URL - pointing to backend port
  const API_BASE_URL = 'http://192.168.10.251:5000/api';
  axios.defaults.baseURL = API_BASE_URL;

  // Update axios headers whenever token changes
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      fetchProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setCustomer(null);
      setActiveSession(null);
      setLoading(false);
    }
  }, [authToken]);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
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
        // Token expired, log out
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const sendOTP = async (phoneNumber) => {
    try {
      const response = await axios.post('/customer/send-otp', { phoneNumber });
      setPhoneNumber(phoneNumber);
      
      // Store OTP in localStorage for development auto-fill
      if (process.env.NODE_ENV === 'development' && response.data.data && response.data.data.otp) {
        localStorage.setItem('dev_otp', response.data.data.otp);
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  };

  // Verify OTP
  const verifyOTP = async (otp) => {
    try {
      const response = await axios.post('/customer/verify-otp', { 
        phoneNumber, 
        otp 
      });
      
      if (response.data.status === 'success' && response.data.data.token) {
        const token = response.data.data.token;
        localStorage.setItem('authToken', token);
        setAuthToken(token);
      }
      
      return response.data;
    } catch (error) {
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
      localStorage.removeItem('pendingTableId');
      
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
      localStorage.removeItem('pendingTableId');
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

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setCustomer(null);
    setActiveSession(null);
  };

  const value = {
    authToken,
    customer,
    loading,
    phoneNumber,
    activeSession,
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