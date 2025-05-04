// src/components/table/TabSession.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

function TabSession() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { activeSession, checkout } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    // If cart has items, show confirmation
    if (cart.length > 0) {
      setShowConfirm(true);
    } else {
      // Otherwise proceed directly
      handleCheckout();
    }
  };

  const handleCancelCheckout = () => {
    setShowConfirm(false);
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      setShowConfirm(false);
      
      const response = await checkout();
      
      if (response.status === 'success') {
        // Clear cart
        clearCart();
        
        toast.success('Successfully checked out');
        navigate('/profile');
      } else {
        toast.error(response.message || 'Failed to checkout');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!activeSession) {
    return (
      <div className="message">
        No active session found. Please scan a table QR code.
      </div>
    );
  }

  // Format start time
  const startTime = new Date(activeSession.startTime).toLocaleString();
  
  // Calculate session duration
  const calculateDuration = () => {
    const startDate = new Date(activeSession.startTime);
    const now = new Date();
    const diffMs = now - startDate;
    
    // Convert to minutes
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div>
      <h2>Your Table Session</h2>
      
      <div className="info-box">
        <p><strong>Session Active</strong></p>
        <p><strong>Restaurant:</strong> {activeSession.restaurant.name}</p>
        <p><strong>Table:</strong> {activeSession.table.tableNumber}</p>
        <p><strong>Started:</strong> {startTime}</p>
        <p><strong>Duration:</strong> {calculateDuration()}</p>
      </div>
      
      {showConfirm ? (
        <div className="confirm-box">
          <p>You still have items in your cart. Are you sure you want to checkout?</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              style={{ flex: 1 }}
            >
              Yes, Checkout
            </button>
            <button 
              onClick={handleCancelCheckout}
              className="back-button"
              disabled={isCheckingOut}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleCheckoutClick}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Processing...' : 'Checkout from Table'}
        </button>
      )}
      
      <button 
        onClick={() => navigate('/orders')} 
        className="add-button"
        style={{ marginTop: '15px' }}
        disabled={isCheckingOut}
      >
        View Order History
      </button>
    </div>
  );
}

export default TabSession;