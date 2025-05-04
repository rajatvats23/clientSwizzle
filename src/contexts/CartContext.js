// src/contexts/CartContext.js - FIXED VERSION
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../services/MenuService';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  // Get auth context for authentication status
  const { authToken, isAuthenticating } = useAuth();

  // Only fetch cart when authenticated AND not in authentication process
  useEffect(() => {
    if (authToken && !isAuthenticating) {
      console.log('Authenticated & stable - fetching cart');
      fetchCart();
    } else {
      console.log('Not authenticated or still authenticating - reset cart');
      // Reset cart state when not authenticated
      setCart([]);
      setTotal(0);
      setLoading(false);
    }
  }, [authToken, isAuthenticating]); // Run when auth status changes

  const fetchCart = useCallback(async () => {
    // Don't try to fetch if not authenticated
    if (!authToken || isAuthenticating) {
      console.log('Skipping cart fetch - not authenticated or still in auth process');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching cart data...');
      const response = await getCart();
      
      if (response.status === 'success' && response.data) {
        const cartItems = response.data.cart?.items || [];
        
        // Transform API cart format to our app format
        const formattedCart = cartItems.map(item => ({
          id: item._id,
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedAddons: item.selectedAddons || [],
          specialInstructions: item.specialInstructions || ''
        }));
        
        setCart(formattedCart);
        setTotal(response.data.totalAmount || 0);
        console.log('Cart loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Only show toast message if authenticated - prevents infinite error messages
      if (authToken && !isAuthenticating) {
        toast.error('Failed to load your cart');
      }
    } finally {
      setLoading(false);
    }
  }, [authToken, isAuthenticating]);

  // Add item to cart - with auth check
  const addItemToCart = async (product, quantity = 1, selectedAddons = [], specialInstructions = '') => {
    // Guard against unauthenticated state
    if (!authToken) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      setLoading(true);
      
      // Optimistically update UI - add item to local cart first
      const tempId = `temp-${Date.now()}`;
      const newItem = {
        id: tempId,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        selectedAddons,
        specialInstructions
      };
      
      setCart(prev => [...prev, newItem]);
      setTotal(prev => prev + (product.price * quantity));
      
      // Make API call
      const response = await apiAddToCart(
        product._id, 
        quantity, 
        selectedAddons, 
        specialInstructions
      );
      
      if (response.status === 'success') {
        // Refresh cart to get server state
        await fetchCart();
        toast.success(`${product.name} added to cart`);
      } else {
        // Revert optimistic update if API call fails
        setCart(prev => prev.filter(item => item.id !== tempId));
        setTotal(prev => prev - (product.price * quantity));
        toast.error(response.message || 'Failed to add item to cart');
      }
    } catch (error) {
      // Revert optimistic update on error
      const tempId = `temp-${Date.now()}`;
      setCart(prev => prev.filter(item => item.id !== tempId));
      setTotal(prev => prev - (product.price * quantity));
      
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity with auth check
  const updateItemQuantity = async (itemId, change) => {
    // Guard against unauthenticated state
    if (!authToken) {
      return;
    }
    
    try {
      setLoading(true);
      // Find current item to get new quantity
      const item = cart.find(item => item.id === itemId);
      if (!item) return;
      
      const newQuantity = item.quantity + change;
      
      // Optimistically update UI
      const updatedCart = cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: newQuantity } 
          : cartItem
      );
      
      const priceDifference = item.price * change;
      
      setCart(updatedCart);
      setTotal(prev => prev + priceDifference);
      
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        await removeItemFromCart(itemId);
      } else {
        // Update quantity on server
        const response = await updateCartItem(itemId, newQuantity);
        
        if (response.status !== 'success') {
          // Revert optimistic update on failure
          setCart(prev => prev.map(item => 
            item.id === itemId 
              ? { ...item, quantity: item.quantity - change } 
              : item
          ));
          setTotal(prev => prev - priceDifference);
          toast.error('Failed to update item quantity');
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      const item = cart.find(item => item.id === itemId);
      if (item) {
        setCart(prev => prev.map(cartItem => 
          cartItem.id === itemId 
            ? { ...cartItem, quantity: cartItem.quantity - change } 
            : cartItem
        ));
        setTotal(prev => prev - (item.price * change));
      }
      
      console.error('Error updating quantity:', error);
      toast.error('Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };
  
  // Remove item from cart with auth check
  const removeItemFromCart = async (itemId) => {
    // Guard against unauthenticated state
    if (!authToken) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Find the item to remove
      const itemToRemove = cart.find(item => item.id === itemId);
      if (!itemToRemove) return;
      
      // Optimistically update UI
      const filteredCart = cart.filter(item => item.id !== itemId);
      const priceReduction = itemToRemove.price * itemToRemove.quantity;
      
      setCart(filteredCart);
      setTotal(prev => prev - priceReduction);
      
      // Call API to remove from server
      const response = await apiRemoveFromCart(itemId);
      
      if (response.status !== 'success') {
        // Revert optimistic update if API call fails
        setCart(prev => [...prev, itemToRemove]);
        setTotal(prev => prev + priceReduction);
        toast.error('Failed to remove item from cart');
      }
    } catch (error) {
      // Revert optimistic update on error
      const itemToRemove = cart.find(item => item.id === itemId);
      if (itemToRemove) {
        setCart(prev => [...prev, itemToRemove]);
        setTotal(prev => prev + (itemToRemove.price * itemToRemove.quantity));
      }
      
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear cart with auth check
  const clearCart = async () => {
    // Guard against unauthenticated state
    if (!authToken) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Optimistically update UI
      const previousCart = [...cart];
      const previousTotal = total;
      
      setCart([]);
      setTotal(0);
      
      // Call API to clear on server
      const response = await apiClearCart();
      
      if (response.status !== 'success') {
        // Revert optimistic update if API call fails
        setCart(previousCart);
        setTotal(previousTotal);
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      // Revert optimistic update on error
      const previousCart = [...cart];
      const previousTotal = total;
      
      setCart(previousCart);
      setTotal(previousTotal);
      
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    cart,
    total,
    loading,
    addToCart: addItemToCart,
    updateQuantity: updateItemQuantity,
    removeFromCart: removeItemFromCart,
    clearCart,
    refreshCart: fetchCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}