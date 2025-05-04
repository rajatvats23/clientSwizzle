// src/components/profile/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function Profile() {
  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { 
    authToken, 
    customer, 
    loading, 
    updateProfile, 
    logout, 
    activeSession,
    isLocalEnvironment 
  } = useAuth();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !authToken) {
      navigate('/');
      return;
    }
    
    // If has active session, redirect to table session
    if (activeSession) {
      navigate('/table-session');
      return;
    }
    
    // Set name from customer data
    if (customer && customer.name) {
      setName(customer.name);
    }
  }, [authToken, customer, loading, activeSession, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      const response = await updateProfile(name);
      
      if (response.status === 'success') {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Your Profile</h1>
      
      {customer && (
        <div className="info-box">
          <p><strong>Phone:</strong> {customer.phoneNumber}</p>
          <p><strong>Name:</strong> {customer.name || 'Not set'}</p>
        </div>
      )}
      
      <form onSubmit={handleUpdateProfile}>
        <div className="form-group">
          <label htmlFor="name">Your Name (Optional)</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        
        <button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      
      <button onClick={() => navigate('/scan')} className="add-button">
        Scan Table QR Code
      </button>
      
      {isLocalEnvironment && (
        <button onClick={() => navigate('/select-table')} className="add-button">
          Select Table (Dev)
        </button>
      )}
      
      {/* Add order history button */}
      <button onClick={() => navigate('/orders')} className="add-button">
        Order History
      </button>
      
      <button onClick={handleLogout} className="back-button">
        Logout
      </button>
    </div>
  );
}

export default Profile;