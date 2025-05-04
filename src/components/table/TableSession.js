// src/components/table/TableSession.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import TabMenu from './TabMenu';
import TabCart from './TabCart';
import TabSession from './TabSession';

function TableSession() {
  // Set menu as default tab
  const [activeTab, setActiveTab] = useState('menu');
  const [isLoading, setIsLoading] = useState(true);
  const { authToken, activeSession } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not authenticated or no active session, redirect
    if (!authToken) {
      navigate('/');
      return;
    }
    
    if (!activeSession) {
      toast.info('No active table session found');
      navigate('/profile');
      return;
    }
    
    setIsLoading(false);
  }, [authToken, activeSession, navigate]);

  // Memorize the session info to avoid unnecessary re-renders
  const getSessionInfo = () => {
    if (!activeSession) return null;
    
    return (
      <div className="info-box" style={{ marginBottom: '20px' }}>
        <p>
          <strong>Table {activeSession.table.tableNumber}</strong> at{' '}
          <strong>{activeSession.restaurant.name}</strong>
        </p>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Restaurant Menu</h1>
      
      {getSessionInfo()}
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </div>
        <div 
          className={`tab ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          Cart
        </div>
        <div 
          className={`tab ${activeTab === 'session' ? 'active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          Table
        </div>
      </div>
      
      {activeTab === 'menu' && <TabMenu />}
      {activeTab === 'cart' && <TabCart />}
      {activeTab === 'session' && <TabSession />}
      
      <button 
        onClick={() => navigate('/profile')} 
        className="back-button"
        style={{ marginTop: '20px' }}
      >
        Back to Profile
      </button>
    </div>
  );
}

export default TableSession;