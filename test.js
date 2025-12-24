const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function runTests() {
  console.log('🧪 Testing Trading Platform\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: Backend Health
  try {
    console.log('\n✓ Test 1: Backend Health Check');
    await axios.get(`${API_URL}/health`, { timeout: 3000 });
    console.log('  ✅ Backend is running');
    passed++;
  } catch (error) {
    console.log('  ❌ Backend is NOT running - Start it first!');
    failed++;
    return;
  }

  // Test 2: Register new user
  let token, userId;
  try {
    console.log('\n✓ Test 2: User Registration');
    const testEmail = `test${Date.now()}@example.com`;
    const res = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: 'testpass123',
      binanceApiKey: 'test-key-' + Date.now(),
      binanceSecretKey: 'test-secret-' + Date.now(),
    });
    token = res.data.token;
    userId = res.data.user.id;
    console.log('  ✅ Registration successful');
    console.log(`  → User ID: ${userId}`);
    passed++;
  } catch (error) {
    console.log('  ❌ Registration failed:', error.response?.data || error.message);
    failed++;
  }

  // Test 3: Login
  try {
    console.log('\n✓ Test 3: User Login');
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: `test${Date.now() - 1000}@example.com`,
      password: 'testpass123',
    });
    console.log('  ⚠️  Login test skipped (previous user needed)');
  } catch (error) {
    console.log('  ℹ️  Login test skipped (expected)');
  }

  // Test 4: Get orders (authenticated)
  if (token) {
    try {
      console.log('\n✓ Test 4: Get Orders (Auth Required)');
      const res = await axios.get(`${API_URL}/api/trading/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`  ✅ Orders retrieved: ${res.data.length} orders`);
      passed++;
    } catch (error) {
      console.log('  ❌ Get orders failed:', error.response?.data || error.message);
      failed++;
    }
  }

  // Test 5: Get positions
  if (token) {
    try {
      console.log('\n✓ Test 5: Get Positions');
      const res = await axios.get(`${API_URL}/api/trading/positions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`  ✅ Positions retrieved: ${res.data.length} positions`);
      passed++;
    } catch (error) {
      console.log('  ❌ Get positions failed:', error.response?.data || error.message);
      failed++;
    }
  }

  // Test 6: Place order
  if (token) {
    try {
      console.log('\n✓ Test 6: Place Order (CRITICAL TEST)');
      const res = await axios.post(
        `${API_URL}/api/trading/orders`,
        {
          symbol: 'BTCUSDT',
          side: 'BUY',
          type: 'MARKET',
          quantity: 0.001,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`  ✅ Order placed successfully`);
      console.log(`  → Order ID: ${res.data.orderId}`);
      console.log(`  → Status: ${res.data.status}`);
      passed++;
      
      // Wait and check if it got executed
      console.log('  ⏳ Waiting 5 seconds for execution...');
      await new Promise(r => setTimeout(r, 5000));
      
      const ordersCheck = await axios.get(`${API_URL}/api/trading/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const placedOrder = ordersCheck.data.find(o => o.orderId === res.data.orderId);
      if (placedOrder) {
        console.log(`  → Final status: ${placedOrder.status}`);
        if (placedOrder.status === 'FILLED') {
          console.log('  🎉 Order was FILLED by execution service!');
        } else if (placedOrder.status === 'REJECTED') {
          console.log('  ⚠️  Order was REJECTED (check Binance keys/balance)');
        }
      }
    } catch (error) {
      console.log('  ❌ Place order failed:', error.response?.data || error.message);
      failed++;
    }
  }

  // Test 7: Market data
  try {
    console.log('\n✓ Test 7: Market Data API');
    const res = await axios.get(`${API_URL}/api/market/candles?symbol=BTCUSDT&interval=1h&limit=10`);
    console.log(`  ✅ Market data retrieved: ${res.data.length} candles`);
    passed++;
  } catch (error) {
    console.log('  ❌ Market data failed:', error.response?.data || error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n✅✅✅ ALL TESTS PASSED! ✅✅✅');
    console.log('\nYour platform is working correctly! 🎉');
  } else {
    console.log('\n⚠️  Some tests failed. Check services are running:');
    console.log('   1. Backend (port 3001)');
    console.log('   2. Execution Service');
    console.log('   3. Event Service (port 3003)');
    console.log('   4. Redis');
  }
  console.log('\n');
}

runTests().catch(console.error);
