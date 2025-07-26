import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Google OAuth Configuration Test\n');

// Test environment variables
console.log('📋 Environment Variables:');
console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'NOT SET'}`);
console.log(`   GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...` : 'NOT SET'}`);
console.log(`   GOOGLE_CALLBACK_URL: ${process.env.GOOGLE_CALLBACK_URL || 'NOT SET'}`);
console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || 'NOT SET'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Validate configuration
console.log('\n✅ Configuration Validation:');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
const clientUrl = process.env.CLIENT_URL;

let isValid = true;

if (!clientId || clientId === 'your_google_client_id_here' || clientId.length < 10) {
  console.log('   ❌ GOOGLE_CLIENT_ID is invalid or not set');
  isValid = false;
} else {
  console.log('   ✅ GOOGLE_CLIENT_ID is valid');
}

if (!clientSecret || clientSecret === 'your_google_client_secret_here' || clientSecret.length < 10) {
  console.log('   ❌ GOOGLE_CLIENT_SECRET is invalid or not set');
  isValid = false;
} else {
  console.log('   ✅ GOOGLE_CLIENT_SECRET is valid');
}

if (!callbackUrl) {
  console.log('   ❌ GOOGLE_CALLBACK_URL is not set');
  isValid = false;
} else if (!callbackUrl.startsWith('http://localhost:5000')) {
  console.log('   ⚠️  GOOGLE_CALLBACK_URL should start with http://localhost:5000');
  console.log(`      Current: ${callbackUrl}`);
  console.log(`      Expected: http://localhost:5000/api/auth/google/callback`);
} else {
  console.log('   ✅ GOOGLE_CALLBACK_URL is valid');
}

if (!clientUrl) {
  console.log('   ❌ CLIENT_URL is not set');
  isValid = false;
} else if (!clientUrl.startsWith('http://localhost:8081')) {
  console.log('   ⚠️  CLIENT_URL should be http://localhost:8081 for your frontend');
  console.log(`      Current: ${clientUrl}`);
  console.log(`      Expected: http://localhost:8081`);
} else {
  console.log('   ✅ CLIENT_URL is valid');
}

console.log('\n🔗 Expected Google Console Configuration:');
console.log('   Authorized JavaScript origins:');
console.log('   - http://localhost:8081');
console.log('   - http://localhost:5173');
console.log('   - http://localhost:4000');
console.log('   - http://localhost:8080');
console.log('');
console.log('   Authorized redirect URIs:');
console.log('   - http://localhost:5000/api/auth/google/callback');

console.log('\n🧪 OAuth Flow URLs:');
console.log(`   Initiate OAuth: http://localhost:5000/api/auth/google`);
console.log(`   Callback URL: ${callbackUrl || 'NOT SET'}`);
console.log(`   Success redirect: ${clientUrl || 'NOT SET'}/auth/callback`);
console.log(`   Error redirect: ${clientUrl || 'NOT SET'}/login?error=oauth_failed`);

if (isValid) {
  console.log('\n🎉 Google OAuth configuration looks good!');
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure your Google Console settings match the expected configuration above');
  console.log('   2. Restart your backend server');
  console.log('   3. Test the OAuth flow by visiting: http://localhost:5000/api/auth/google');
} else {
  console.log('\n❌ Google OAuth configuration has issues that need to be fixed');
  console.log('\n🔧 To fix:');
  console.log('   1. Update your .env file with correct values');
  console.log('   2. Update your Google Console OAuth configuration');
  console.log('   3. Restart your backend server');
}

console.log('\n🔍 Debug Information:');
console.log('   Your frontend is running on: http://localhost:8081');
console.log('   Your backend should be running on: http://localhost:5000');
console.log('   OAuth initiation URL: http://localhost:5000/api/auth/google');
console.log('   OAuth callback URL: http://localhost:5000/api/auth/google/callback');
