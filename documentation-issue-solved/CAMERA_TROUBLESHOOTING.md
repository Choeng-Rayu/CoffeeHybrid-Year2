# 🔧 **Camera Preview Troubleshooting Guide**

## 🚨 **Camera Preview Not Showing - Let's Fix This!**

I've added debugging features and a test component to help identify why the camera preview isn't showing.

---

## 🔍 **Step 1: Check Browser Console**

### **Open Browser Developer Tools:**
1. **Press F12** or **Right-click → Inspect**
2. **Go to Console tab**
3. **Start the camera** in QR scanner
4. **Look for these messages:**

#### **✅ Expected Success Messages:**
```
🎥 Starting camera...
✅ Camera stream obtained: MediaStream {...}
✅ Video metadata loaded
✅ Video playing successfully
✅ Video started playing
```

#### **❌ Common Error Messages:**
```
❌ Camera access error: NotAllowedError
❌ Camera access error: NotFoundError  
❌ Video play error: NotSupportedError
❌ Video error: ...
```

---

## 🔍 **Step 2: Test with Simple Camera Component**

I've created a simple camera test component. Let's use it to isolate the issue:

### **Add to Your QR Scanner Page:**
```jsx
// Temporarily add this import at the top of QRScanner.jsx
import CameraTest from './CameraTest';

// Add this button in your QR scanner component
<button onClick={() => setShowTest(!showTest)}>
  🧪 Test Camera
</button>

{showTest && <CameraTest />}
```

### **Or Create a Test Page:**
1. **Create a new test page** with just the CameraTest component
2. **Navigate to it** and test camera functionality
3. **Check if video preview works** in isolation

---

## 🔍 **Step 3: Check Debug Information**

I've added debug info to your QR scanner. Look for:

```
Debug: Stream: ✅ Active | Video: ✅ Set | Playing: ✅ Yes
```

### **Debug Status Meanings:**
- **Stream: ✅ Active** - Camera permission granted and stream created
- **Video: ✅ Set** - Video element has the stream assigned
- **Playing: ✅ Yes** - Video is actively playing

### **If Any Show ❌:**
- **Stream: ❌ None** - Camera permission denied or not available
- **Video: ❌ Not Set** - Stream not assigned to video element
- **Playing: ❌ No** - Video not playing (autoplay blocked?)

---

## 🔍 **Step 4: Visual Debug Borders**

I've added colored borders to help identify elements:

- **🟢 Green border** around video container
- **🔴 Red border** around video element  
- **🟡 Yellow dashed border** around overlay

### **What You Should See:**
1. **Green container** with proper size
2. **Red video element** inside container
3. **Camera preview** inside red border
4. **Yellow overlay** on top (if visible)

---

## 🛠️ **Common Issues & Solutions**

### **Issue 1: Camera Permission Denied**
#### **Symptoms:**
```
❌ Camera access error: NotAllowedError
```

#### **Solutions:**
1. **Check browser address bar** for camera icon
2. **Click camera icon** → Allow
3. **Refresh page** and try again
4. **Check browser settings** → Privacy → Camera

### **Issue 2: No Camera Available**
#### **Symptoms:**
```
❌ Camera access error: NotFoundError
```

#### **Solutions:**
1. **Check if camera is connected** (for desktop)
2. **Close other apps** using camera
3. **Try different browser**
4. **Check device camera settings**

### **Issue 3: Video Element Not Playing**
#### **Symptoms:**
- Stream active but video not visible
- Playing: ❌ No in debug info

#### **Solutions:**
1. **Check autoplay policy** in browser
2. **User interaction required** - click to start
3. **Add muted attribute** to video element
4. **Check for JavaScript errors**

### **Issue 4: CSS Hiding Video**
#### **Symptoms:**
- Video element exists but not visible
- Debug borders show but no video content

#### **Solutions:**
1. **Check z-index** values
2. **Check opacity** settings
3. **Check overflow: hidden**
4. **Check position: absolute** conflicts

---

## 🔧 **Quick Fixes to Try**

### **Fix 1: Force Video Visibility**
```css
.video {
  opacity: 1 !important;
  z-index: 999 !important;
  position: relative !important;
  display: block !important;
}
```

### **Fix 2: Remove All Overlays Temporarily**
```jsx
// Comment out the overlay temporarily
{/* <div className={styles.scanOverlay}>
  ...
</div> */}
```

### **Fix 3: Simplify Video Element**
```jsx
<video
  ref={videoRef}
  style={{
    width: '100%',
    height: '400px',
    backgroundColor: 'red', // Debug background
    border: '5px solid yellow' // Debug border
  }}
  autoPlay
  playsInline
  muted
/>
```

### **Fix 4: Check Browser Compatibility**
```javascript
// Check if getUserMedia is supported
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.error('❌ getUserMedia not supported');
  setError('Camera not supported in this browser');
}
```

---

## 📱 **Mobile-Specific Issues**

### **iOS Safari:**
- **Requires user interaction** before video plays
- **Add playsinline** attribute
- **Check iOS version** (older versions have issues)

### **Android Chrome:**
- **Check camera permissions** in site settings
- **Try different facingMode** values
- **Check if camera is used by other apps**

---

## 🧪 **Testing Steps**

### **Step 1: Basic Camera Test**
1. **Use CameraTest component**
2. **Check if simple video works**
3. **Verify camera permissions**

### **Step 2: Browser Console Check**
1. **Look for error messages**
2. **Check debug information**
3. **Verify stream creation**

### **Step 3: Visual Inspection**
1. **Look for debug borders**
2. **Check element sizes**
3. **Verify video element exists**

### **Step 4: Progressive Enhancement**
1. **Start with simple video**
2. **Add overlays gradually**
3. **Test each addition**

---

## 📋 **Debugging Checklist**

### **✅ Browser Support:**
- [ ] Modern browser (Chrome, Firefox, Safari, Edge)
- [ ] HTTPS connection (required for camera)
- [ ] Camera permissions granted

### **✅ Console Messages:**
- [ ] No JavaScript errors
- [ ] Camera stream created successfully
- [ ] Video metadata loaded
- [ ] Video playing successfully

### **✅ Visual Elements:**
- [ ] Video container visible (green border)
- [ ] Video element visible (red border)
- [ ] Proper dimensions (400px height)
- [ ] Debug info shows all ✅

### **✅ Camera Hardware:**
- [ ] Camera connected and working
- [ ] Not used by other applications
- [ ] Proper drivers installed (desktop)

---

## 🎯 **Next Steps**

1. **Check browser console** for error messages
2. **Test with CameraTest component** to isolate issue
3. **Look for debug borders** to verify element visibility
4. **Try the quick fixes** listed above
5. **Report specific error messages** for further help

**Let me know what you see in the browser console and debug information!** 🔍

The debug borders and console logs will help us identify exactly where the issue is occurring.
