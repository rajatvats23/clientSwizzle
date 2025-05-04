import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import TabMenu from './TabMenu';
import TabCart from './TabCart';
import TabSession from './TabSession';

function TableSession() {
  const [activeTab, setActiveTab] = useState('menu');
  const [isLoading, setIsLoading] = useState(true);
  const { authToken, activeSession, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not authenticated or no active session, redirect
    if (!authToken) {
      navigate('/');
      return;
    }
    
    if (!activeSession) {
      navigate('/profile');
      return;
    }
    
    setIsLoading(false);
  }, [authToken, activeSession, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Restaurant Menu</h1>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => handleTabChange('menu')}
        >
          Menu
        </div>
        <div 
          className={`tab ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => handleTabChange('cart')}
        >
          Cart
        </div>
        <div 
          className={`tab ${activeTab === 'session' ? 'active' : ''}`}
          onClick={() => handleTabChange('session')}
        >
          Session
        </div>
      </div>
      
      {activeTab === 'menu' && <TabMenu />}
      {activeTab === 'cart' && <TabCart />}
      {activeTab === 'session' && <TabSession />}
      
      <button onClick={handleLogout} className="back-button">
        Logout
      </button>
    </div>
  );
}

export default TableSession;