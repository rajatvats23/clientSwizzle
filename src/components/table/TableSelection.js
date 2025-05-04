import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function TableSelection() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('');
  const { authToken, scanTable } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authToken) {
      navigate('/');
      return;
    }
    
    // Fetch available tables
    fetchTables();
  }, [authToken, navigate]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      // This would normally come from your API
      // For demo purposes, we'll use hardcoded data
      const mockTables = [
        { id: 'table1', tableNumber: 'Table 1' },
        { id: 'table2', tableNumber: 'Table 2' },
        { id: 'table3', tableNumber: 'Table 3' },
        { id: 'table4', tableNumber: 'Table 4' },
        { id: 'table5', tableNumber: 'Table 5' }
      ];
      
      setTables(mockTables);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (e) => {
    setSelectedTable(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }
    
    try {
      setLoading(true);
      const response = await scanTable(selectedTable);
      
      if (response.status === 'success') {
        toast.success(`Successfully started session at ${response.data.table.tableNumber}`);
        navigate('/table-session');
      } else {
        toast.error(response.message || 'Failed to select table');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading tables...</div>;
  }

  return (
    <div className="container">
      <h1>Select a Table</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table-select">Choose a table:</label>
          <select
            id="table-select"
            value={selectedTable}
            onChange={handleTableSelect}
            required
          >
            <option value="">-- Select a table --</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>
                {table.tableNumber}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit" disabled={loading || !selectedTable}>
          {loading ? 'Processing...' : 'Start Table Session'}
        </button>
      </form>
      
      <button
        onClick={() => navigate('/profile')}
        className="back-button"
        disabled={loading}
      >
        Back to Profile
      </button>
    </div>
  );
}

export default TableSelection;