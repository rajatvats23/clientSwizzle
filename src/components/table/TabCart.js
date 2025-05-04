import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { placeOrder } from '../../services/MenuService';

function TabCart() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    try {
      setIsPlacingOrder(true);
      
      // Format cart items for API
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const response = await placeOrder(orderItems);
      
      if (response.status === 'success') {
        toast.success('Order placed successfully!');
        clearCart();
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div>
        <h2>Your Cart</h2>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Cart</h2>
      
      {cart.map(item => (
        <div className="cart-item" key={item.id}>
          <div>
            <div><strong>{item.name}</strong></div>
            <div>${item.price.toFixed(2)} × {item.quantity}</div>
          </div>
          
          <div className="quantity-control">
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity(item.id, -1)}
            >
              -
            </button>
            
            <span className="quantity">{item.quantity}</span>
            
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity(item.id, 1)}
            >
              +
            </button>
            
            <button 
              className="quantity-btn"
              onClick={() => removeFromCart(item.id)}
              style={{ marginLeft: '10px' }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <div className="cart-total">
        Total: ${total.toFixed(2)}
      </div>
      
      <button 
        onClick={handlePlaceOrder}
        disabled={isPlacingOrder}
      >
        {isPlacingOrder ? 'Processing...' : 'Place Order'}
      </button>
      
      <button 
        onClick={clearCart}
        className="back-button"
        disabled={isPlacingOrder}
      >
        Clear Cart
      </button>
    </div>
  );
}

export default TabCart;