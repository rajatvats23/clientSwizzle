import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { fetchMenu } from '../../services/MenuService';

function TabMenu() {
  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const response = await fetchMenu();
      
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
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const renderCategory = (category) => {
    // Get products for this category
    const products = menuData.products.filter(
      product => product.category && product.category._id === category._id
    );
    
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
        <button onClick={loadMenu} className="add-button">
          Retry
        </button>
      </div>
    );
  }

  if (!menuData || !menuData.categories || !menuData.products) {
    return <div className="message">No menu items available</div>;
  }

  return (
    <div>
      {menuData.categories.map(renderCategory)}
    </div>
  );
}

export default TabMenu;