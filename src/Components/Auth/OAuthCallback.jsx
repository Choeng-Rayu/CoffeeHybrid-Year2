import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const OAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');
        const error = urlParams.get('error');

        console.log('OAuth Callback - Processing:', { token: !!token, user: !!userStr, error });

        if (error) {
          console.error('OAuth Error:', error);
          setError(getErrorMessage(error));
          setStatus('error');
          
          // Redirect to login after showing error
          setTimeout(() => {
            navigate('/login', { 
              state: { error: getErrorMessage(error) }
            });
          }, 3000);
          return;
        }

        if (!token || !userStr) {
          console.error('Missing token or user data');
          setError('Authentication failed: Missing credentials');
          setStatus('error');
          
          setTimeout(() => {
            navigate('/login', { 
              state: { error: 'Authentication failed. Please try again.' }
            });
          }, 3000);
          return;
        }

        try {
          // Parse user data
          const user = JSON.parse(decodeURIComponent(userStr));
          console.log('OAuth Success - User:', user);

          // Store authentication data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          // Update user context
          login(user);

          setStatus('success');

          // Redirect based on user role
          setTimeout(() => {
            if (user.role === 'admin' || user.role === 'seller') {
              navigate('/seller-dashboard');
            } else {
              navigate('/menu');
            }
          }, 2000);

        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setError('Authentication failed: Invalid user data');
          setStatus('error');
          
          setTimeout(() => {
            navigate('/login', { 
              state: { error: 'Authentication error. Please try again.' }
            });
          }, 3000);
        }

      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setError('Authentication failed: Processing error');
        setStatus('error');
        
        setTimeout(() => {
          navigate('/login', { 
            state: { error: 'Authentication error. Please try again.' }
          });
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [location.search, login, navigate]);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'oauth_not_configured':
        return 'Google OAuth is not configured. Please use email/password login.';
      case 'oauth_failed':
        return 'Google authentication failed. Please try again.';
      case 'callback_failed':
        return 'Authentication callback failed. Please try again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #4285f4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>Processing Authentication...</h2>
            <p style={{ color: '#666' }}>Please wait while we complete your Google sign-in.</p>
          </div>
        );

      case 'success':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '60px', 
              color: '#28a745',
              marginBottom: '20px'
            }}>✅</div>
            <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Authentication Successful!</h2>
            <p style={{ color: '#666' }}>Redirecting you to your dashboard...</p>
          </div>
        );

      case 'error':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '60px', 
              color: '#dc3545',
              marginBottom: '20px'
            }}>❌</div>
            <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Authentication Failed</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
            <p style={{ color: '#999', fontSize: '14px' }}>Redirecting to login page...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        {renderContent()}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
