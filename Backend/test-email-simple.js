import dotenv from 'dotenv';
import { sendPasswordResetEmail } from './services/emailService.js';

dotenv.config();

async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    console.log('📧 Email credentials:');
    console.log('   GMAIL_USER:', process.env.GMAIL_USER);
    console.log('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '***configured***' : 'NOT SET');
    
    const testEmail = 'choengrayu307@gmail.com';
    const testToken = 'test-token-123';
    const testUserName = 'Test User';
    
    console.log('\n📤 Sending test email...');
    const result = await sendPasswordResetEmail(testEmail, testToken, testUserName);
    
    console.log('✅ Email sent successfully!');
    console.log('📋 Result:', result);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

testEmail();
