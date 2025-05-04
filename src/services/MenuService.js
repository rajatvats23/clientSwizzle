// src/services/MenuService.js - FIXED VERSION
import axios from 'axios';
import config from '../config/config';

// Set up axios defaults
axios.defaults.baseURL = config.API_BASE_URL;

// Function to set auth token in headers
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem(config.storage.authToken);
};

// Helper function to handle API responses and errors consistently
const handleApiResponse = async (apiCall) => {
  try {
    // Check if authenticated first
    if (!isAuthenticated()) {
      console.log('API call skipped - not authenticated');
      // Return empty success response when not authenticated
      return { status: 'success', data: null };
    }
    
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    
    // Don't handle 401 errors here - let the AuthContext interceptor handle them
    throw error.response ? error.response.data : { message: 'Network error. Please check your connection.' };
  }
};

// Fetch restaurant menu with caching
let cachedMenu = null;
let menuCacheTime = 0;
const MENU_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchMenu = async (forceRefresh = false) => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Menu fetch skipped - not authenticated');
    return { status: 'success', data: { categories: [], products: [] } };
  }
  
  // Return cached menu if available and not expired
  const now = Date.now();
  if (!forceRefresh && cachedMenu && (now - menuCacheTime < MENU_CACHE_DURATION)) {
    console.log('Returning cached menu');
    return cachedMenu;
  }
  
  console.log('Fetching menu from API');
  // Otherwise fetch from API
  return handleApiResponse(async () => {
    const response = await axios.get('/customer/menu');
    // Cache the result
    cachedMenu = response.data;
    menuCacheTime = now;
    return response;
  });
};

// Cart API calls
export const getCart = async () => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Cart fetch skipped - not authenticated');
    return { 
      status: 'success', 
      data: { 
        cart: { items: [] }, 
        totalAmount: 0 
      } 
    };
  }
  
  console.log('Fetching cart from API');
  return handleApiResponse(() => axios.get('/customer/cart'));
};

export const addToCart = async (productId, quantity = 1, selectedAddons = [], specialInstructions = '') => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Add to cart skipped - not authenticated');
    return { status: 'fail', message: 'Authentication required' };
  }
  
  return handleApiResponse(() => axios.post('/customer/cart', {
    productId,
    quantity,
    selectedAddons,
    specialInstructions
  }));
};

export const updateCartItem = async (itemId, quantity, selectedAddons, specialInstructions) => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Update cart skipped - not authenticated');
    return { status: 'fail', message: 'Authentication required' };
  }
  
  const payload = {};
  if (quantity !== undefined) payload.quantity = quantity;
  if (selectedAddons !== undefined) payload.selectedAddons = selectedAddons;
  if (specialInstructions !== undefined) payload.specialInstructions = specialInstructions;
  
  return handleApiResponse(() => axios.put(`/customer/cart/${itemId}`, payload));
};

export const removeFromCart = async (itemId) => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Remove from cart skipped - not authenticated');
    return { status: 'fail', message: 'Authentication required' };
  }
  
  return handleApiResponse(() => axios.delete(`/customer/cart/${itemId}`));
};

export const clearCart = async () => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Clear cart skipped - not authenticated');
    return { status: 'fail', message: 'Authentication required' };
  }
  
  return handleApiResponse(() => axios.delete('/customer/cart'));
};

// Order API calls
export const placeOrder = async (specialInstructions = '') => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Place order skipped - not authenticated');
    return { status: 'fail', message: 'Authentication required' };
  }
  
  return handleApiResponse(() => axios.post('/customer/orders', { specialInstructions }));
};

export const getOrders = async () => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Get orders skipped - not authenticated');
    return { status: 'success', data: { orders: [] } };
  }
  
  return handleApiResponse(() => axios.get('/customer/orders'));
};

export const getOrderById = async (orderId) => {
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log('Get order by ID skipped - not authenticated');
    return { status: 'fail', message: 'Authentication required' };
  }
  
  return handleApiResponse(() => axios.get(`/customer/orders/${orderId}`));
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