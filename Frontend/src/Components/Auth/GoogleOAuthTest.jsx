import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

const GoogleOAuthTest = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkGoogleOAuthStatus();
  }, []);

  const checkGoogleOAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.googleOAuthStatus();
      setStatus(response);
      setError('');
    } catch (err) {
      setError('Failed to check Google OAuth status');
      console.error('Google OAuth status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Checking Google OAuth configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔍 Google OAuth Test</h2>
      
      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '1rem', 
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {status && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Configuration Status</h3>
          <div style={{ 
            background: status.configured ? '#efe' : '#fee',
            color: status.configured ? '#363' : '#c33',
            padding: '1rem',
            borderRadius: '6px',
            border: status.configured ? '1px solid #cfc' : '1px solid #fcc'
          }}>
            <p><strong>Status:</strong> {status.configured ? '✅ Configured' : '❌ Not Configured'}</p>
            <p><strong>Client ID:</strong> {status.clientId}</p>
            <p><strong>Callback URL:</strong> {status.callbackUrl}</p>
            <p><strong>Message:</strong> {status.message}</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>Test Actions</h3>
        <button
          onClick={testGoogleLogin}
          style={{
            background: '#4285f4',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '1rem'
          }}
          disabled={!status?.configured}
        >
          Test Google Login
        </button>
        
        <button
          onClick={checkGoogleOAuthStatus}
          style={{
            background: '#666',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Refresh Status
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <h4>How to Enable Google OAuth:</h4>
        <ol>
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
          <li>Create OAuth 2.0 credentials</li>
          <li>Add authorized redirect URI: <code>http://localhost:5000/api/auth/google/callback</code></li>
          <li>Update your Backend/.env file with the credentials</li>
          <li>Restart your backend server</li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleOAuthTest;
