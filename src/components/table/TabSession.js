import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

function TabSession() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { activeSession, checkout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
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

  return (
    <div>
      <h2>Your Table Session</h2>
      
      <div className="info-box">
        <p><strong>Session Active</strong></p>
        <p><strong>Restaurant:</strong> {activeSession.restaurant.name}</p>
        <p><strong>Table:</strong> {activeSession.table.tableNumber}</p>
        <p><strong>Started:</strong> {startTime}</p>
      </div>
      
      <button 
        onClick={handleCheckout}
        disabled={isCheckingOut}
      >
        {isCheckingOut ? 'Processing...' : 'Checkout from Table'}
      </button>
    </div>
  );
}

export default TabSession;