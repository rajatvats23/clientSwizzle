import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrders, getOrderById } from '../../services/MenuService';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await getOrders();
      
      if (response.status === 'success') {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.message || 'Failed to load orders');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const response = await getOrderById(orderId);
      
      if (response.status === 'success') {
        setSelectedOrder(response.data.order);
      } else {
        toast.error(response.message || 'Failed to load order details');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const backToOrders = () => {
    setSelectedOrder(null);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Display order details if an order is selected
  if (selectedOrder) {
    return (
      <div className="container">
        <h1>Order Details</h1>
        
        <div className="info-box">
          <p><strong>Order ID:</strong> {selectedOrder._id}</p>
          <p><strong>Status:</strong> {selectedOrder.status}</p>
          <p><strong>Total:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
          <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
          
          {selectedOrder.specialInstructions && (
            <p><strong>Special Instructions:</strong> {selectedOrder.specialInstructions}</p>
          )}
        </div>
        
        <h2>Items</h2>
        {selectedOrder.items.map(item => (
          <div className="cart-item" key={item._id}>
            <div>
              <div><strong>{item.product.name}</strong></div>
              <div>${item.price.toFixed(2)} × {item.quantity}</div>
              <div><strong>Status:</strong> {item.status}</div>
              
              {item.specialInstructions && (
                <div className="special-instructions">
                  Note: {item.specialInstructions}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <button onClick={backToOrders} className="back-button">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Orders</h1>
      
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div>
          {orders.map(order => (
            <div className="order-card" key={order._id} onClick={() => viewOrderDetails(order._id)}>
              <div><strong>Order ID:</strong> {order._id}</div>
              <div><strong>Status:</strong> {order.status}</div>
              <div><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</div>
              <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={() => navigate('/profile')} className="back-button">
        Back to Profile
      </button>
    </div>
  );
}

export default OrderHistory;