// Updated MenuService.js with full cart and order API integration
import axios from 'axios';

// Use port 5000 for backend API calls
const API_BASE_URL = 'http://localhost:5000/api';

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

// Cart API calls
export const getCart = async () => {
  try {
    const response = await axios.get('/customer/cart');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const addToCart = async (productId, quantity = 1, selectedAddons = [], specialInstructions = '') => {
  try {
    const response = await axios.post('/customer/cart', {
      productId,
      quantity,
      selectedAddons,
      specialInstructions
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const updateCartItem = async (itemId, quantity, selectedAddons, specialInstructions) => {
  try {
    const payload = {};
    if (quantity !== undefined) payload.quantity = quantity;
    if (selectedAddons !== undefined) payload.selectedAddons = selectedAddons;
    if (specialInstructions !== undefined) payload.specialInstructions = specialInstructions;
    
    const response = await axios.put(`/customer/cart/${itemId}`, payload);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const removeFromCart = async (itemId) => {
  try {
    const response = await axios.delete(`/customer/cart/${itemId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const clearCart = async () => {
  try {
    const response = await axios.delete('/customer/cart');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

// Order API calls
export const placeOrder = async (specialInstructions = '') => {
  try {
    const response = await axios.post('/customer/orders', { 
      specialInstructions 
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const getOrders = async () => {
  try {
    const response = await axios.get('/customer/orders');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`/customer/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export default {
  setAuthToken,
  fetchMenu,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  placeOrder,
  getOrders,
  getOrderById
};