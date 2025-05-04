import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { placeOrder } from '../../services/MenuService';

function TabCart() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { cart, total, loading, updateQuantity, removeFromCart, clearCart, refreshCart } = useCart();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    try {
      setIsPlacingOrder(true);
      
      const response = await placeOrder(specialInstructions);
      
      if (response.status === 'success') {
        toast.success('Order placed successfully!');
        // No need to call clearCart since the API already cleared it
        // Just refresh to get the empty cart
        refreshCart();
        setSpecialInstructions('');
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your cart...</div>;
  }

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
            {item.specialInstructions && (
              <div className="special-instructions">
                Note: {item.specialInstructions}
              </div>
            )}
          </div>
          
          <div className="quantity-control">
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity(item.id, -1)}
              disabled={loading}
            >
              -
            </button>
            
            <span className="quantity">{item.quantity}</span>
            
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity(item.id, 1)}
              disabled={loading}
            >
              +
            </button>
            
            <button 
              className="quantity-btn"
              onClick={() => removeFromCart(item.id)}
              style={{ marginLeft: '10px' }}
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <div className="cart-total">
        Total: ${total.toFixed(2)}
      </div>
      
      <div className="form-group">
        <label htmlFor="special-instructions">Special Instructions (Optional)</label>
        <textarea
          id="special-instructions"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="Any special instructions for your order?"
          rows={3}
          disabled={isPlacingOrder}
        />
      </div>
      
      <button 
        onClick={handlePlaceOrder}
        disabled={isPlacingOrder || loading}
      >
        {isPlacingOrder ? 'Processing...' : 'Place Order'}
      </button>
      
      <button 
        onClick={clearCart}
        className="back-button"
        disabled={isPlacingOrder || loading}
      >
        Clear Cart
      </button>
    </div>
  );
}

export default TabCart;