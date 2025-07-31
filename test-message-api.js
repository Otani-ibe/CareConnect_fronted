// Test script for message API endpoint
// Run this in browser console after logging in

async function testMessageAPI() {
  try {
    // Get the stored token
    const token = localStorage.getItem('token');
    console.log('Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('❌ No token found. Please login first.');
      return;
    }
    
    // Test the message endpoint
    const response = await fetch('/api/message/687e8009655057cea853fae5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Message API is working!');
    } else {
      console.log('❌ Message API error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Also test with a non-existent message ID
async function testNonExistentMessage() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('❌ No token found. Please login first.');
      return;
    }
    
    const response = await fetch('/api/message/nonexistent-id', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('Non-existent message test:');
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('❌ Non-existent message test failed:', error);
  }
}

console.log('Message API Test Functions:');
console.log('- testMessageAPI() - Test with real message ID');
console.log('- testNonExistentMessage() - Test with fake message ID'); 