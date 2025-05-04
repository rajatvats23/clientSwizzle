// src/config/config.js
const config = {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    showDevFeatures: process.env.NODE_ENV === 'development',
    
    // Function to check if we're on localhost
    isLocalhost: () => {
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1';
    },
    
    // Local storage keys
    storage: {
      authToken: 'authToken',
      pendingTableId: 'pendingTableId',
      devOtp: 'dev_otp'
    }
  };
  
  export default config;