// For ES module compatibility with node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testIdentifyApi() {
  const baseUrl = 'http://localhost:3000/api/identify';
  
  console.log('Running identity reconciliation tests...');
  
  // Test 1: Create a new primary contact
  console.log('\nTest 1: Creating a new primary contact with email and phone');
  try {
    const response1 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        phoneNumber: '+1234567890'
      })
    });
    const result1 = await response1.json();
    console.log('Result:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('Error in Test 1:', error);
  }
  
  // Test 2: Query with same email and phone
  console.log('\nTest 2: Query with same email and phone (should return the same contact)');
  try {
    const response2 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        phoneNumber: '+1234567890'
      })
    });
    const result2 = await response2.json();
    console.log('Result:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('Error in Test 2:', error);
  }
  
  // Test 3: Query with just the email
  console.log('\nTest 3: Query with just the email (should find the existing contact)');
  try {
    const response3 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    const result3 = await response3.json();
    console.log('Result:', JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error('Error in Test 3:', error);
  }
  
  // Test 4: Query with just the phone
  console.log('\nTest 4: Query with just the phone (should find the existing contact)');
  try {
    const response4 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '+1234567890'
      })
    });
    const result4 = await response4.json();
    console.log('Result:', JSON.stringify(result4, null, 2));
  } catch (error) {
    console.error('Error in Test 4:', error);
  }
  
  // Test 5: Add a different phone to the same email
  console.log('\nTest 5: Add a different phone to the same email (should create a secondary contact)');
  try {
    const response5 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        phoneNumber: '+0987654321'
      })
    });
    const result5 = await response5.json();
    console.log('Result:', JSON.stringify(result5, null, 2));
  } catch (error) {
    console.error('Error in Test 5:', error);
  }
  
  // Test 6: Query with just the new phone
  console.log('\nTest 6: Query with just the new phone (should link to the same primary contact)');
  try {
    const response6 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '+0987654321'
      })
    });
    const result6 = await response6.json();
    console.log('Result:', JSON.stringify(result6, null, 2));
  } catch (error) {
    console.error('Error in Test 6:', error);
  }
  
  // Test 7: Test the health check endpoint
  console.log('\nTest 7: Health check endpoint');
  try {
    const response7 = await fetch('http://localhost:3000/api/health', {
      method: 'GET'
    });
    const result7 = await response7.json();
    console.log('Health Check Result:', JSON.stringify(result7, null, 2));
  } catch (error) {
    console.error('Error in Test 7:', error);
  }
  
  console.log('\nTests completed!');
}

testIdentifyApi().catch(error => {
  console.error('Error running tests:', error);
});
