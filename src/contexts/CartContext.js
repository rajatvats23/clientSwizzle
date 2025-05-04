import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Calculate total
    const cartTotal = cart.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    setTotal(cartTotal);
  }, [cart]);

  // Add item to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      // Check if product already in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product._id);
      
      if (existingItemIndex !== -1) {
        // Product exists, increase quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Add new product to cart
        return [...prevCart, {
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1
        }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, change) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const itemIndex = updatedCart.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        const newQuantity = updatedCart[itemIndex].quantity + change;
        
        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          return updatedCart.filter(item => item.id !== itemId);
        }
        
        updatedCart[itemIndex] = {
          ...updatedCart[itemIndex],
          quantity: newQuantity
        };
      }
      
      return updatedCart;
    });
  };
  
  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };
  
  const value = {
    cart,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}