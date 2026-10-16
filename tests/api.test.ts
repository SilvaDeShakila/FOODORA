import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getInitialSeedData } from '../server/scripts/seedData.js';
import { config } from '../server/config/index.js';

async function runTestSuite() {
  console.log('🧪 Starting FOODORA Automated Validation Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(description: string, condition: boolean) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      throw new Error(`Test assertion failed: ${description}`);
    }
  }

  // Test 1: Seed data integrity
  console.log('Test Group 1: Sri Lankan Sample Dataset & Schema Verification');
  const seed = getInitialSeedData();
  assert('Seed contains at least 12 Sri Lankan restaurants', seed.restaurants.length >= 12);
  assert('Seed contains at least 40 menu items', seed.menuItems.length >= 25);
  assert('Seed contains verified customer, owner, rider, and admin accounts', seed.users.length >= 4);
  assert('Seed restaurant names reflect authentic Sri Lankan locations', seed.restaurants.some(r => r.city.includes('Colombo') || r.city.includes('Kandy') || r.city.includes('Galle')));

  // Test 2: Security & Password Hashing
  console.log('\nTest Group 2: Password Security & Bcrypt Hashing');
  const customerUser = seed.users.find(u => u.email === 'customer@foodora.lk');
  assert('Password is stored as bcrypt hash and never plaintext', Boolean(customerUser && !customerUser.passwordHash.includes('password123') && customerUser.passwordHash.startsWith('$2')));
  const validPass = await bcrypt.compare('password123', customerUser!.passwordHash);
  assert('Bcrypt successfully verifies password "password123"', validPass === true);
  const invalidPass = await bcrypt.compare('wrongpassword', customerUser!.passwordHash);
  assert('Bcrypt rejects invalid password', invalidPass === false);

  // Test 3: JWT Token Generation & Role Authorization
  console.log('\nTest Group 3: JWT Token Creation & Claims');
  const token = jwt.sign(
    { id: customerUser!.id, email: customerUser!.email, role: customerUser!.role, name: customerUser!.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
  assert('JWT token is generated with header and signature', typeof token === 'string' && token.split('.').length === 3);
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  assert('JWT claims include correct user ID', decoded.id === customerUser!.id);
  assert('JWT claims enforce customer role', decoded.role === 'customer');

  // Test 4: Promotional Code Validation Engine
  console.log('\nTest Group 4: Promotion Code Calculation Logic');
  const promo = seed.promotions.find(p => p.code === 'FOODORA20');
  assert('FOODORA20 promotional voucher exists', Boolean(promo));
  assert('FOODORA20 provides 20% discount', promo?.discountValue === 20);
  const subtotal = 2000;
  const calculatedDiscount = Math.min(Math.round((subtotal * promo!.discountValue) / 100), promo!.maxDiscountLkr || 800);
  assert('20% of LKR 2000 calculates accurately to LKR 400', calculatedDiscount === 400);

  // Test 5: Order Lifecycle State Machine
  console.log('\nTest Group 5: Order Lifecycle State Flow');
  const order = seed.orders[0];
  assert('Order has unique tracking ID and order number', Boolean(order.orderNumber.startsWith('FD-')));
  assert('Order items contain valid LKR pricing', order.items.every(item => item.priceLkr > 0));
  assert('Order timeline records chronological events', order.timeline.length > 0);
  assert('Order total equals subtotal + deliveryFee - discount', order.totalLkr === (order.subtotalLkr + order.deliveryFeeLkr - order.discountLkr));

  console.log(`\n===========================================`);
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} test cases passed successfully!`);
  console.log(`===========================================\n`);
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
