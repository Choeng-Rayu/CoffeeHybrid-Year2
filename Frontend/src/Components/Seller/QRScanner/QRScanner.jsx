import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { ordersAPI } from '../../../services/api';
import { useUser } from '../../../context/UserContext';
import styles from './QRScanner.module.css';

const QRScanner = () => {
  const { user } = useUser();
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [stream, setStream] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [scanCooldown, setScanCooldown] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const cooldownTimeoutRef = useRef(null);

  // Initialize camera for QR scanning
  const startCamera = async () => {
    try {
      setError('');
      console.log('🎥 Starting camera...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('✅ Camera stream obtained:', mediaStream);

      // Check video tracks
      const videoTracks = mediaStream.getVideoTracks();
      console.log('📹 Video tracks:', videoTracks);
      if (videoTracks.length > 0) {
        console.log('📹 First video track:', videoTracks[0]);
        console.log('📹 Track enabled:', videoTracks[0].enabled);
        console.log('📹 Track ready state:', videoTracks[0].readyState);
        console.log('📹 Track settings:', videoTracks[0].getSettings());
      } else {
        console.error('❌ No video tracks found!');
      }

      setStream(mediaStream);
      setIsScanning(true);
      startQRDetection();
    } catch (error) {
      console.error('❌ Camera access error:', error);
      setError('Camera access denied. Please allow camera permissions and try again.');
      setScanMode('manual');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }
    setIsScanning(false);
    setScanCooldown(false);
    setLastScanTime(0);
  };

  // QR Code detection using jsQR with cooldown
  const startQRDetection = () => {
    scanIntervalRef.current = setInterval(() => {
      // Skip scanning if in cooldown period
      if (scanCooldown) {
        return;
      }

      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            const currentTime = Date.now();

            // Check if enough time has passed since last scan (3 seconds)
            if (currentTime - lastScanTime >= 3000) {
              console.log('QR Code detected:', code.data);
              console.log('⏱️ Scan cooldown: Starting 3-second cooldown...');

              // Set cooldown
              setLastScanTime(currentTime);
              setScanCooldown(true);

              // Automatically verify the detected QR code
              handleVerifyQR(code.data);

              // Clear cooldown after 3 seconds
              cooldownTimeoutRef.current = setTimeout(() => {
                setScanCooldown(false);
                console.log('⏱️ Scan cooldown: Ready to scan again');
              }, 3000);
            } else {
              const remainingTime = Math.ceil((3000 - (currentTime - lastScanTime)) / 1000);
              console.log(`⏱️ Scan cooldown: ${remainingTime}s remaining...`);
            }
          }
        } catch (error) {
          console.error('QR detection error:', error);
        }
      }
    }, 500); // Reduced frequency to 500ms (was 300ms)
  };

  // Handle QR verification
  const handleVerifyQR = async (token) => {
    if (!token.trim()) {
      setError('Please enter a QR token or scan a QR code');
      return;
    }

    console.log('🔍 QR Verification Debug:');
    console.log('   Token:', token.trim());
    console.log('   API Base URL:', import.meta.env.VITE_API_URL);
    console.log('   Environment:', import.meta.env.MODE);

    setIsLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      console.log('📡 Calling verifyQR API...');
      const response = await ordersAPI.verifyQR(token.trim());
      console.log('✅ QR Verification successful:', response);

      setVerificationResult(response);
      setManualToken('');

      // Stop scanning after successful verification
      if (isScanning) {
        stopCamera();
      }

      // Auto-clear result after 10 seconds
      setTimeout(() => {
        setVerificationResult(null);
      }, 10000);

    } catch (error) {
      console.error('❌ QR Verification failed:', error);
      console.error('   Error response:', error.response?.data);
      console.error('   Error status:', error.response?.status);
      console.error('   Error config:', error.config);

      setError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual form submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleVerifyQR(manualToken);
  };

  // Reset everything
  const handleReset = () => {
    setVerificationResult(null);
    setError('');
    setManualToken('');
    if (isScanning) {
      stopCamera();
    }
  };

  // Handle video stream assignment when stream is available
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('📹 Assigning stream to video element...');
      console.log('📹 Video element found:', videoRef.current);

      videoRef.current.srcObject = stream;
      console.log('📹 Stream assigned to video element');

      // Add event listeners to debug video loading
      videoRef.current.onloadedmetadata = () => {
        console.log('✅ Video metadata loaded');
        console.log('📐 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        console.log('📱 Video element size:', videoRef.current.offsetWidth, 'x', videoRef.current.offsetHeight);

        videoRef.current.play().then(() => {
          console.log('✅ Video playing successfully');
          console.log('▶️ Video paused?', videoRef.current.paused);
          console.log('🔇 Video muted?', videoRef.current.muted);
        }).catch(err => {
          console.error('❌ Video play error:', err);
        });
      };

      videoRef.current.onplay = () => {
        console.log('🎬 Video onplay event fired');
      };

      videoRef.current.onplaying = () => {
        console.log('🎥 Video onplaying event fired');
      };

      videoRef.current.onerror = (err) => {
        console.error('❌ Video error:', err);
      };

      videoRef.current.oncanplay = () => {
        console.log('✅ Video can play');
      };

      // Force play
      videoRef.current.play().catch(playError => {
        console.error('❌ Play error:', playError);
      });
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <div className={styles.scannerContainer}>
      <div className={styles.scannerCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>📱 Order Verification</h2>
          <p className={styles.subtitle}>
            Scan customer QR codes to complete orders
          </p>
          <div className={styles.shopInfo}>
            <span className={styles.shopName}>{user?.shopName || 'Coffee Shop'}</span>
          </div>
        </div>

        {/* Mode Selection */}
        <div className={styles.modeSelection}>
          <button
            onClick={() => setScanMode('camera')}
            className={`${styles.modeBtn} ${scanMode === 'camera' ? styles.active : ''}`}
          >
            📷 Camera Scan
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`${styles.modeBtn} ${scanMode === 'manual' ? styles.active : ''}`}
          >
            ⌨️ Manual Input
          </button>
        </div>

        {/* Camera Scanner */}
        {scanMode === 'camera' && (
          <div className={styles.cameraSection}>
            {!isScanning ? (
              <div className={styles.cameraStart}>
                <div className={styles.cameraIcon}>📷</div>
                <h3>Start Camera Scanner</h3>
                <p>Position the customer's QR code in front of the camera</p>
                <button onClick={startCamera} className={styles.startCameraBtn}>
                  Start Camera
                </button>
              </div>
            ) : (
              <div className={styles.cameraActive}>
                <div className={styles.cameraHeader}>
                  <div className={styles.cameraStatus}>
                    <div className={styles.cameraIndicator}></div>
                    <span>📹 Camera Active - Live Preview</span>
                  </div>
                  <div style={{color: '#00ff00', fontSize: '12px', marginTop: '10px'}}>
                    Debug: Stream: {stream ? '✅ Active' : '❌ None'} |
                    Video: {videoRef.current?.srcObject ? '✅ Set' : '❌ Not Set'} |
                    Playing: {videoRef.current?.paused === false ? '✅ Yes' : '❌ No'}
                  </div>
                </div>

                <div className={styles.videoContainer}>
                  <video
                    ref={videoRef}
                    className={styles.video}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '400px',
                      backgroundColor: '#333',
                      border: '3px solid #ff0000',
                      display: 'block',
                      objectFit: 'cover'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                    willReadFrequently="true"
                  />

                  {/* Scanning overlay with frame */}
                  <div className={styles.scanOverlay}>
                    <div className={`${styles.scanFrame} ${verificationResult ? styles.success : ''}`}>
                      {/* Scanning line animation */}
                      {isScanning && !verificationResult && (
                        <div className={styles.scanLine}></div>
                      )}
                    </div>

                    <p className={styles.scanInstructions}>
                      {verificationResult
                        ? '✅ QR Code Detected Successfully!'
                        : scanCooldown
                        ? '⏱️ Cooldown active - Please wait 3 seconds...'
                        : 'Position QR code within the green frame'
                      }
                    </p>
                  </div>

                  {/* Simple overlay for testing */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 255, 0, 0.8)',
                    color: '#000',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    📹 Camera should be visible above this text
                  </div>
                </div>
                {/* Status Indicators */}
                <div className={styles.statusIndicators}>
                  {isScanning && !verificationResult && !scanCooldown && (
                    <div className={styles.scanningStatus}>
                      <div className={styles.scanningDot}></div>
                      <span>Scanning for QR code...</span>
                    </div>
                  )}

                  {scanCooldown && (
                    <div className={styles.cooldownStatus}>
                      <div className={styles.cooldownDot}></div>
                      <span>⏱️ Cooldown active - 3 seconds</span>
                    </div>
                  )}

                  {verificationResult && (
                    <div className={styles.successStatus}>
                      <span>✅ QR Code Found!</span>
                      <small>Processing order verification...</small>
                    </div>
                  )}
                </div>

                <div className={styles.cameraControls}>
                  <button onClick={stopCamera} className={styles.stopCameraBtn}>
                    ⏹️ Stop Camera
                  </button>
                  <p className={styles.manualFallback}>
                    Having trouble? <button onClick={() => setScanMode('manual')} className={styles.linkBtn}>
                      Use manual input
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Input */}
        {scanMode === 'manual' && (
          <div className={styles.manualSection}>
            <form onSubmit={handleManualSubmit} className={styles.manualForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="qrToken" className={styles.label}>
                  QR Token
                </label>
                <input
                  type="text"
                  id="qrToken"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className={styles.input}
                  placeholder="Enter QR token from customer's phone"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={isLoading || !manualToken.trim()}
                  className={styles.verifyBtn}
                >
                  {isLoading ? 'Verifying...' : 'Verify Order'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={styles.resetBtn}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={styles.errorResult}>
            <div className={styles.resultIcon}>❌</div>
            <h3>Verification Failed</h3>
            <p>{error}</p>
            <button onClick={() => setError('')} className={styles.dismissBtn}>
              Dismiss
            </button>
          </div>
        )}

        {/* Success Result */}
        {verificationResult && verificationResult.success && (
          <div className={styles.successResult}>
            <div className={styles.resultIcon}>✅</div>
            <h3>Order Verified Successfully!</h3>

            <div className={styles.orderDetails}>
              <div className={styles.customerInfo}>
                <h4>Customer Information</h4>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Name:</span>
                  <span className={styles.value}>{verificationResult.order.customer}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Order ID:</span>
                  <span className={styles.value}>{verificationResult.order.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Total:</span>
                  <span className={styles.value}>{formatPrice(verificationResult.order.total)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Pickup Time:</span>
                  <span className={styles.value}>{formatDate(verificationResult.order.pickupTime)}</span>
                </div>
              </div>

              <div className={styles.orderItems}>
                <h4>Order Items</h4>
                {verificationResult.order.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDetails}>
                      Size: {item.size} | Sugar: {item.sugarLevel} | Qty: {item.quantity}
                      {item.addOns && item.addOns.length > 0 && (
                        <div className={styles.addOns}>
                          Add-ons: {item.addOns.map(addon => addon.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.successActions}>
              <button onClick={handleReset} className={styles.newOrderBtn}>
                Scan Next Order
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={styles.instructions}>
          <h4>📋 How to Use</h4>
          <ul>
            <li>Ask customer to show their QR code</li>
            <li>Use camera to scan or manually enter the token</li>
            <li>Verify order details with customer</li>
            <li>Complete the order and hand over items</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
