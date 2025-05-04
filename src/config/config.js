// src/config/config.js - Improved with debugging options
const config = {
  // API configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  showDevFeatures: process.env.NODE_ENV === 'development',
  
  // Debug settings - enable these for troubleshooting
  debug: {
    enabled: true, // Set to false in production
    logApiCalls: true,
    logAuthState: true,
    logErrors: true
  },
  
  // Authentication settings
  auth: {
    tokenExpiryDays: 30,
    autoLogoutOn401: true,
    redirectAfterLogin: true
  },
  
  // Function to check if we're on localhost
  isLocalhost: () => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  },
  
  // Local storage keys
  storage: {
    authToken: 'authToken',
    pendingTableId: 'pendingTableId',
    devOtp: 'dev_otp',
    authState: 'auth_state'
  },
  
  // Useful logging functions
  log: (message, data) => {
    if (config.debug.enabled) {
      console.log(`[App] ${message}`, data || '');
    }
  },
  
  logAuth: (message, data) => {
    if (config.debug.enabled && config.debug.logAuthState) {
      console.log(`[Auth] ${message}`, data || '');
    }
  },
  
  logApi: (message, data) => {
    if (config.debug.enabled && config.debug.logApiCalls) {
      console.log(`[API] ${message}`, data || '');
    }
  },
  
  logError: (message, error) => {
    if (config.debug.enabled && config.debug.logErrors) {
      console.error(`[Error] ${message}`, error || '');
    }
  }
};

export default config;