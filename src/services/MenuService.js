import axios from 'axios';

// Use port 5000 for backend API calls
const API_BASE_URL = 'http://192.168.10.251:5000/api';

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Function to set auth token in headers
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Fetch restaurant menu
export const fetchMenu = async () => {
  try {
    const response = await axios.get('/customer/menu');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

// Place order
export const placeOrder = async (items) => {
  try {
    const response = await axios.post('/customer/order', { items });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

// Submit feedback
export const submitFeedback = async (feedback) => {
  try {
    const response = await axios.post('/customer/feedback', feedback);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export default {
  setAuthToken,
  fetchMenu,
  placeOrder,
  submitFeedback
};