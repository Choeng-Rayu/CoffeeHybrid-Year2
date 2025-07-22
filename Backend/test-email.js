// Test script for email functionality
import { testEmailConfiguration, sendPasswordResetEmail } from './services/emailService.js';

const testEmail = async () => {
  console.log('🧪 Testing email configuration...');
  
  try {
    // Test email configuration
    const isConfigValid = await testEmailConfiguration();
    
    if (isConfigValid) {
      console.log('✅ Email configuration is working!');
      
      // Test sending a password reset email
      console.log('📧 Testing password reset email...');
      const result = await sendPasswordResetEmail(
        'test@example.com', // Replace with your test email
        'test-reset-token-123',
        'Test User'
      );
      
      console.log('✅ Test email sent successfully:', result);
    } else {
      console.log('❌ Email configuration failed');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
};

// Run the test
testEmail();
