import { resetAllDataToSeed } from '../services/jsonStorage.js';

async function runSeed() {
  console.log('🌱 Starting FOODORA Sri Lanka sample database seeding...');
  try {
    await resetAllDataToSeed();
    console.log('✅ FOODORA database successfully seeded with authentic Sri Lankan restaurants, dishes, and accounts!');
    console.log('Accounts available:');
    console.log(' - Customer: customer@foodora.lk / password123');
    console.log(' - Restaurant Owner: owner@foodora.lk / password123');
    console.log(' - Rider: rider@foodora.lk / password123');
    console.log(' - Admin: admin@foodora.lk / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

runSeed();
