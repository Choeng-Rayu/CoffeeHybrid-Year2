console.log('🧹 Clearing Rate Limits...');

// Since we're using in-memory rate limiting, restarting the server will clear all limits
console.log('✅ Rate limits will be cleared when you restart the server');
console.log('');
console.log('📝 Current rate limit settings for development:');
console.log('   - Auth endpoints: 50 requests per minute');
console.log('   - General API: 1000 requests per minute');
console.log('   - Password reset: 3 requests per hour');
console.log('');
console.log('🔧 To clear rate limits:');
console.log('   1. Stop your backend server (Ctrl+C)');
console.log('   2. Restart it with: npm start');
console.log('');
console.log('💡 The rate limits are now much more lenient in development mode!');
