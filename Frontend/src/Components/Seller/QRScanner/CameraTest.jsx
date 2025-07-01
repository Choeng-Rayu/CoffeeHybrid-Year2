import React, { useRef, useState } from 'react';

const CameraTest = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isActive, setIsActive] = useState(false);

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera test...');
      setError('');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('✅ Got media stream:', mediaStream);
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded');
          console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        };

        videoRef.current.onplay = () => {
          console.log('✅ Video started playing');
        };

        videoRef.current.onerror = (err) => {
          console.error('❌ Video error:', err);
          setError('Video error: ' + err.message);
        };

        try {
          await videoRef.current.play();
          console.log('✅ Video play() successful');
        } catch (playError) {
          console.error('❌ Video play error:', playError);
          setError('Play error: ' + playError.message);
        }
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      setError('Camera error: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
      console.log('🛑 Camera stopped');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>📹 Camera Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startCamera} 
          disabled={isActive}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: isActive ? '#ccc' : '#00ff00',
            color: isActive ? '#666' : '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: isActive ? 'not-allowed' : 'pointer'
          }}
        >
          {isActive ? '✅ Camera Active' : '▶️ Start Camera'}
        </button>
        
        <button 
          onClick={stopCamera} 
          disabled={!isActive}
          style={{
            padding: '10px 20px',
            backgroundColor: !isActive ? '#ccc' : '#ff0000',
            color: !isActive ? '#666' : '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: !isActive ? 'not-allowed' : 'pointer'
          }}
        >
          ⏹️ Stop Camera
        </button>
      </div>

      {error && (
        <div style={{
          color: '#ff0000',
          backgroundColor: '#ffe6e6',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #ff0000'
        }}>
          ❌ {error}
        </div>
      )}

      <div style={{
        color: '#00ff00',
        backgroundColor: '#001100',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        <div>Stream: {stream ? '✅ Active' : '❌ None'}</div>
        <div>Video Element: {videoRef.current ? '✅ Exists' : '❌ None'}</div>
        <div>Video Source: {videoRef.current?.srcObject ? '✅ Set' : '❌ Not Set'}</div>
        <div>Video Playing: {videoRef.current?.paused === false ? '✅ Yes' : '❌ No'}</div>
        <div>Video Ready State: {videoRef.current?.readyState || 'N/A'}</div>
      </div>

      <div style={{
        border: '3px solid #00ff00',
        borderRadius: '10px',
        padding: '10px',
        backgroundColor: '#000',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#333',
            border: '2px solid #ff0000',
            display: 'block'
          }}
          autoPlay
          playsInline
          muted
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>📱 This is a simple camera test to check if video preview works.</p>
        <p>🔍 Check browser console for detailed logs.</p>
        <p>🎥 You should see a live camera preview in the video element above.</p>
      </div>
    </div>
  );
};

export default CameraTest;
