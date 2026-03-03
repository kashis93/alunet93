// Test file to check imports
console.log('Testing imports...');

try {
  const { db } = require('../services/firebase');
  console.log('✅ Firebase import successful');
} catch (error) {
  console.error('❌ Firebase import failed:', error);
}

try {
  const { formatDistanceToNow } = require('date-fns');
  console.log('✅ date-fns import successful');
} catch (error) {
  console.error('❌ date-fns import failed:', error);
}

try {
  const { Heart } = require('lucide-react');
  console.log('✅ lucide-react import successful');
} catch (error) {
  console.error('❌ lucide-react import failed:', error);
}
