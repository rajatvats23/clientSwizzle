// src/components/table/TabMenu.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { fetchMenu } from '../../services/MenuService';

function TabMenu() {
  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, loading: cartLoading } = useCart();

  // Load menu with retry mechanism
  const loadMenu = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const response = await fetchMenu(forceRefresh);
      
      if (response.status === 'success') {
        setMenuData(response.data);
      } else {
        setErrorMessage(response.message || 'Failed to load menu');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  // Filter products based on search term
  const getFilteredProducts = (products, categoryId) => {
    if (!searchTerm.trim()) {
      // If no search term, just return products for this category
      return products.filter(
        product => product.category && product.category._id === categoryId
      );
    }
    
    // Filter by search term and category
    const searchLower = searchTerm.toLowerCase();
    return products.filter(
      product => 
        product.category && 
        product.category._id === categoryId &&
        (
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
        )
    );
  };

  const renderCategory = (category) => {
    if (!menuData || !menuData.products) return null;
    
    // Get products for this category
    const products = getFilteredProducts(menuData.products, category._id);
    
    if (products.length === 0) return null;
    
    return (
      <div className="category" key={category._id}>
        <div className="category-header">{category.name}</div>
        
        {products.map(product => (
          <div className="product-card" key={product._id}>
            <div className="product-name">{product.name}</div>
            <div className="product-price">${product.price.toFixed(2)}</div>
            
            {product.description && (
              <div className="product-description">{product.description}</div>
            )}
            
            <button 
              className="add-button"
              onClick={() => handleAddToCart(product)}
              disabled={cartLoading}
            >
              {cartLoading ? 'Adding...' : 'Add to Order'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading menu...</div>;
  }

  if (errorMessage) {
    return (
      <div className="message error">
        {errorMessage}
        <button onClick={() => loadMenu(true)} className="add-button">
          Retry
        </button>
      </div>
    );
  }

  if (!menuData || !menuData.categories || !menuData.products) {
    return <div className="message">No menu items available</div>;
  }

  // Count total products
  const totalProducts = menuData.products.length;
  
  // Count filtered products
  const filteredProductCount = searchTerm.trim() 
    ? menuData.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && 
         product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ).length
    : totalProducts;

  return (
    <div>
      {/* Search box */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {searchTerm.trim() && (
        <div className="info-box" style={{ marginBottom: '10px' }}>
          Found {filteredProductCount} items matching "{searchTerm}"
          {filteredProductCount === 0 && (
            <button 
              onClick={() => setSearchTerm('')}
              className="add-button"
              style={{ marginLeft: '10px' }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
      
      {/* Render categories with their products */}
      {menuData.categories.map(renderCategory)}
      
      {/* If filtered but no results */}
      {searchTerm.trim() && filteredProductCount === 0 && (
        <div className="message">
          No menu items match your search. Try different keywords.
        </div>
      )}
      
      {/* Refresh button */}
      <button 
        onClick={() => loadMenu(true)} 
        className="back-button"
        style={{ marginTop: '20px' }}
      >
        Refresh Menu
      </button>
    </div>
  );
}

export default TabMenu;