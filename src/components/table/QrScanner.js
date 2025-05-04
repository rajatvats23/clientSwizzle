// src/components/table/QrScanner.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/config';

function QrScanner() {
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const { authToken, scanTable } = useAuth();
  const navigate = useNavigate();
  
  // Use a ref to store the scanner instance
  const html5QrCodeRef = useRef(null);
  
  // Initialize scanner - wrapped in useCallback to prevent unnecessary re-renders
  const initScanner = useCallback(() => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      return; // Scanner is already running
    }

    setScannerError('');
    
    const qrCodeSuccessCallback = (decodedText) => {
      setIsScanning(false);
      setScanResult(decodedText);
      handleTableScan(decodedText);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    // Create instance and store in ref
    html5QrCodeRef.current = new Html5Qrcode("reader");
    setIsScanning(true);
    
    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      (error) => {
        // Only log console errors in development
        if (process.env.NODE_ENV === 'development') {
          console.debug("QR scanning ongoing:", error);
        }
      }
    ).catch((err) => {
      setScannerError(`Unable to start scanner: ${err.message || 'Unknown error'}`);
      setIsScanning(false);
      toast.error(`Unable to start scanner: ${err.message || 'Unknown error'}`);
    });
  }, []);
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authToken) {
      navigate('/');
      return;
    }
    
    // Initialize scanner
    initScanner();
    
    // Check if there's a pending table ID
    const pendingTableId = localStorage.getItem(config.storage.pendingTableId);
    if (pendingTableId) {
      handleTableScan(pendingTableId);
      localStorage.removeItem(config.storage.pendingTableId);
    }
    
    // Cleanup function
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(error => 
          console.error("Error stopping scanner:", error)
        );
      }
    };
  }, [authToken, navigate, initScanner]);

  const handleTableScan = async (qrCodeIdentifier) => {
    if (isProcessing) return; // Prevent multiple scans
    
    try {
      setIsProcessing(true);
      setScanResult(`Processing table scan for ${qrCodeIdentifier}...`);
      
      // Stop scanner while processing
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      
      const response = await scanTable(qrCodeIdentifier);
      
      if (response.status === 'success') {
        toast.success(`Successfully started session at table ${response.data.table.tableNumber}`);
        navigate('/table-session');
      } else {
        toast.error(response.message || 'Failed to process table scan');
        // Restart scanner if scan failed
        initScanner();
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while scanning table');
      setScanResult(`Error: ${error.message}`);
      // Restart scanner if scan failed
      initScanner();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(console.error);
    }
    setScannerError('');
    initScanner();
  };

  return (
    <div className="container">
      <h1>Scan Table QR Code</h1>
      
      <div id="reader" className="scanner-container"></div>
      
      {scannerError && (
        <div className="message error">
          <p>{scannerError}</p>
          <button onClick={handleRetryScanner} className="add-button">
            Retry Scanner
          </button>
        </div>
      )}
      
      {scanResult && (
        <div className="info-box">
          <p>{scanResult}</p>
        </div>
      )}
      
      <button
        onClick={() => navigate('/profile')}
        className="back-button"
        disabled={isProcessing}
      >
        Back to Profile
      </button>
    </div>
  );
}

export default QrScanner;