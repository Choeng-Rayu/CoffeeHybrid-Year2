import React from 'react';

const DebugEnv = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'not set';

  const testGoogleOAuth = () => {
    const url = `${API_BASE_URL}/auth/google`;
    console.log('🔍 Constructed Google OAuth URL:', url);
    alert(`Google OAuth URL: ${url}`);
    // Uncomment to actually redirect:
    // window.location.href = url;
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      margin: '20px', 
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h3>🔧 Frontend Environment Debug</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Environment Variables:</strong>
        <ul>
          <li><strong>VITE_API_URL:</strong> {API_BASE_URL}</li>
          <li><strong>VITE_NODE_ENV:</strong> {NODE_ENV}</li>
          <li><strong>VITE_GOOGLE_CLIENT_ID:</strong> {GOOGLE_CLIENT_ID.substring(0, 20)}...</li>
        </ul>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Constructed URLs:</strong>
        <ul>
          <li><strong>Google OAuth:</strong> {API_BASE_URL}/auth/google</li>
          <li><strong>Health Check:</strong> {API_BASE_URL}/health</li>
          <li><strong>Menu API:</strong> {API_BASE_URL}/menu</li>
        </ul>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Current Location:</strong>
        <ul>
          <li><strong>Origin:</strong> {window.location.origin}</li>
          <li><strong>Hostname:</strong> {window.location.hostname}</li>
          <li><strong>Full URL:</strong> {window.location.href}</li>
        </ul>
      </div>

      <button 
        onClick={testGoogleOAuth}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Test Google OAuth URL (Alert Only)
      </button>

      <button 
        onClick={() => {
          const url = `${API_BASE_URL}/health`;
          fetch(url)
            .then(response => response.json())
            .then(data => {
              console.log('Health check response:', data);
              alert(`Health check successful: ${JSON.stringify(data, null, 2)}`);
            })
            .catch(error => {
              console.error('Health check failed:', error);
              alert(`Health check failed: ${error.message}`);
            });
        }}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Health Check
      </button>
    </div>
  );
};

export default DebugEnv;
