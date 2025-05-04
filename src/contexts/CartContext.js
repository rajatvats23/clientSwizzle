import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as apiClearCart } from '../services/MenuService';
import { toast } from 'react-toastify';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load cart from API on initial load
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
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
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItemToCart = async (product, quantity = 1, selectedAddons = [], specialInstructions = '') => {
    try {
      setLoading(true);
      const response = await addToCart(
        product._id, 
        quantity, 
        selectedAddons, 
        specialInstructions
      );
      
      if (response.status === 'success') {
        // Refresh cart after adding item
        await fetchCart();
        toast.success(`${product.name} added to cart`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = async (itemId, change) => {
    try {
      setLoading(true);
      // Find current item to get new quantity
      const item = cart.find(item => item.id === itemId);
      if (!item) return;
      
      const newQuantity = item.quantity + change;
      
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        await removeItemFromCart(itemId);
      } else {
        // Update quantity
        await updateCartItem(itemId, newQuantity);
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };
  
  // Remove item from cart
  const removeItemFromCart = async (itemId) => {
    try {
      setLoading(true);
      await removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await apiClearCart();
      setCart([]);
      setTotal(0);
    } catch (error) {
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