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




































.scannerContainer {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.scannerCard {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  width: 100%;
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.shopInfo {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
}

.shopName {
  font-weight: 600;
  color: #d4a574;
}

.modeSelection {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  border-bottom: 1px solid #eee;
}

.modeBtn {
  flex: 1;
  padding: 1rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modeBtn:hover {
  border-color: #d4a574;
}

.modeBtn.active {
  border-color: #2c1810;
  background-color: #2c1810;
  color: white;
}

.cameraSection {
  padding: 2rem;
}

.cameraStart {
  text-align: center;
  padding: 3rem;
}

.cameraIcon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.cameraStart h3 {
  color: #2c1810;
  margin-bottom: 1rem;
}

.cameraStart p {
  color: #666;
  margin-bottom: 2rem;
}

.startCameraBtn {
  background-color: #2c1810;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.startCameraBtn:hover {
  background-color: #3d2318;
}

.cameraActive {
  text-align: center;
}

/* Camera status header */
.cameraHeader {
  margin-bottom: 1rem;
}

.cameraStatus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 20px;
  padding: 10px 20px;
  color: #00ff00;
  font-weight: 600;
  font-size: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 255, 0, 0.2);
}

.cameraIndicator {
  width: 12px;
  height: 12px;
  background: #00ff00;
  border-radius: 50%;
  animation: cameraLive 1.5s infinite ease-in-out;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
}

@keyframes cameraLive {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Camera helper text */
.cameraHelper {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
}

.helperText {
  background: rgba(0, 255, 0, 0.9);
  color: #000;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0, 255, 0, 0.3);
  animation: helperPulse 3s infinite ease-in-out;
}

@keyframes helperPulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.videoContainer {
  position: relative;
  display: block;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: #000;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  border: 3px solid #00ff00; /* Debug border to see container */
}

.video {
  width: 100%;
  height: 400px;
  display: block;
  object-fit: cover;
  background: #333; /* Debug background */
  border: 2px solid #ff0000; /* Debug border to see video element */
  /* Ensure video is clearly visible */
  opacity: 1 !important;
  z-index: 1;
  position: relative;
}

.scanOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  /* Very light overlay so camera is clearly visible */
  background: rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.scanFrame {
  width: 280px;
  height: 280px;
  position: relative;
  border: 3px dashed #00ff00;
  border-radius: 16px;
  animation: scanFramePulse 2s infinite ease-in-out;
  box-shadow:
    0 0 20px rgba(0, 255, 0, 0.6),
    inset 0 0 20px rgba(0, 255, 0, 0.1);
  /* Transparent background so camera is visible */
  background: transparent;
  z-index: 3;
}

/* Enhanced corner brackets */
.scanFrame::before,
.scanFrame::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #00ff00;
  border-radius: 8px;
  animation: cornerGlow 2s infinite ease-in-out;
}

.scanFrame::before {
  top: -4px;
  left: -4px;
  border-right: none;
  border-bottom: none;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
}

.scanFrame::after {
  top: -4px;
  right: -4px;
  border-left: none;
  border-bottom: none;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
  animation-delay: 0.5s;
}

/* Additional bottom corners using pseudo elements on overlay */
.scanOverlay::before,
.scanOverlay::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #00ff00;
  border-radius: 8px;
  animation: cornerGlow 2s infinite ease-in-out;
}

.scanOverlay::before {
  bottom: calc(50% - 140px);
  left: calc(50% - 140px);
  border-right: none;
  border-top: none;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
  animation-delay: 1s;
}

.scanOverlay::after {
  bottom: calc(50% - 140px);
  right: calc(50% - 140px);
  border-left: none;
  border-top: none;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
  animation-delay: 1.5s;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Scanning line animation */
.scanLine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00ff00, transparent);
  animation: scanLineMove 2s infinite ease-in-out;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
  border-radius: 2px;
}

@keyframes scanLineMove {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(280px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scanFramePulse {
  0% {
    border-color: rgba(0, 255, 0, 0.8);
    box-shadow:
      0 0 20px rgba(0, 255, 0, 0.4),
      inset 0 0 20px rgba(0, 255, 0, 0.1);
  }
  50% {
    border-color: rgba(0, 255, 0, 1);
    box-shadow:
      0 0 30px rgba(0, 255, 0, 0.6),
      inset 0 0 30px rgba(0, 255, 0, 0.2);
  }
  100% {
    border-color: rgba(0, 255, 0, 0.8);
    box-shadow:
      0 0 20px rgba(0, 255, 0, 0.4),
      inset 0 0 20px rgba(0, 255, 0, 0.1);
  }
}

@keyframes cornerGlow {
  0% {
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
  }
  50% {
    border-color: #00aa00;
    box-shadow: 0 0 25px rgba(0, 255, 0, 0.8);
  }
  100% {
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
  }
}

/* Success state for scan frame */
.scanFrame.success {
  border-color: #00ff00 !important;
  animation: successPulse 0.6s ease-in-out;
  box-shadow: 0 0 50px rgba(0, 255, 0, 0.9) !important;
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.scanInstructions {
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  margin-top: 15px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(0, 255, 0, 0.4);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
  animation: instructionGlow 3s infinite ease-in-out;
  /* Position at bottom to not block camera view */
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  max-width: 90%;
}

@keyframes instructionGlow {
  0% { border-color: rgba(0, 255, 0, 0.3); }
  50% { border-color: rgba(0, 255, 0, 0.6); }
  100% { border-color: rgba(0, 255, 0, 0.3); }
}

/* Status Indicators */
.statusIndicators {
  margin: 1rem 0;
  text-align: center;
}

.scanningStatus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #00ff00;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid rgba(0, 255, 0, 0.3);
  backdrop-filter: blur(10px);
}

.cooldownStatus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #ffa500;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 165, 0, 0.3);
  backdrop-filter: blur(10px);
}

.scanningDot {
  width: 12px;
  height: 12px;
  background: #00ff00;
  border-radius: 50%;
  animation: scanningPulse 1s infinite ease-in-out;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
}

.cooldownDot {
  width: 12px;
  height: 12px;
  background: #ffa500;
  border-radius: 50%;
  animation: cooldownPulse 1.5s infinite ease-in-out;
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.6);
}

@keyframes scanningPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes cooldownPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.successStatus {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #00ff00;
  font-weight: 600;
  background: rgba(0, 255, 0, 0.1);
  padding: 15px 25px;
  border-radius: 20px;
  border: 2px solid #00ff00;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: successGlow 0.5s ease-in-out;
}

.successStatus small {
  color: rgba(0, 255, 0, 0.8);
  font-size: 12px;
  font-weight: 400;
}

@keyframes successGlow {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.cameraControls {
  margin-top: 2rem;
}

.stopCameraBtn {
  background-color: #dc3545;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1rem;
}

.stopCameraBtn:hover {
  background-color: #c82333;
}

.manualFallback {
  color: #666;
  font-size: 0.9rem;
}

.linkBtn {
  background: none;
  border: none;
  color: #d4a574;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
}

.manualSection {
  padding: 2rem;
}

.manualForm {
  max-width: 500px;
  margin: 0 auto;
}

.inputGroup {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  font-weight: 600;
  color: #2c1810;
  margin-bottom: 0.5rem;
}

.input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #d4a574;
}

.buttonGroup {
  display: flex;
  gap: 1rem;
}

.verifyBtn {
  flex: 1;
  background-color: #2c1810;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.verifyBtn:hover:not(:disabled) {
  background-color: #3d2318;
}

.verifyBtn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.resetBtn {
  background-color: #6c757d;
  color: white;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.resetBtn:hover {
  background-color: #5a6268;
}

.errorResult,
.successResult {
  margin: 2rem;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.errorResult {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.successResult {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.resultIcon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.errorResult h3,
.successResult h3 {
  margin-bottom: 1rem;
}

.dismissBtn {
  background-color: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.orderDetails {
  text-align: left;
  margin: 2rem 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.customerInfo,
.orderItems {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
}

.customerInfo h4,
.orderItems h4 {
  color: #2c1810;
  margin-bottom: 1rem;
  border-bottom: 2px solid #d4a574;
  padding-bottom: 0.5rem;
}

.infoRow {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.infoRow .label {
  font-weight: 600;
  color: #666;
}

.infoRow .value {
  font-weight: 500;
  color: #2c1810;
}

.orderItem {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.itemName {
  font-weight: 600;
  color: #2c1810;
  margin-bottom: 0.25rem;
}

.itemDetails {
  font-size: 0.9rem;
  color: #666;
}

.addOns {
  margin-top: 0.25rem;
  font-style: italic;
}

.successActions {
  margin-top: 2rem;
}

.newOrderBtn {
  background-color: #28a745;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.1rem;
}

.newOrderBtn:hover {
  background-color: #218838;
}

.instructions {
  background: #f8f9fa;
  padding: 2rem;
  border-top: 1px solid #eee;
}

.instructions h4 {
  color: #2c1810;
  margin-bottom: 1rem;
}

.instructions ul {
  list-style: none;
  padding: 0;
}

.instructions li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.instructions li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #28a745;
  font-weight: bold;
}

@media (max-width: 768px) {
  .scannerContainer {
    padding: 0.5rem;
  }
  
  .header {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .modeSelection {
    flex-direction: column;
  }
  
  .orderDetails {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .buttonGroup {
    flex-direction: column;
  }
}
