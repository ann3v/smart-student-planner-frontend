import { sequelize } from '../src/models';
import { User, Subject, Task, Schedule } from '../src/models';

// Use a test database — in production this would be a separate DB
// For now we use the same DB but clean tables between tests

let testToken: string | null = null;
let testUserId: number | null = null;

async function getTestToken(): Promise<string> {
  if (testToken) return testToken;

  const jwt = require('jsonwebtoken');
  // Find or create a test user
  let user = await User.findOne({ where: { email: 'test@example.com' } });
  if (!user) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('TestPassword123!', 10);
    user = await User.create({
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      isVerified: true,
      failedLoginAttempts: 0,
      failedVerificationAttempts: 0,
    });
  }
  testUserId = user.id;
  testToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
  return testToken;
}

function getTestUserId(): number {
  return testUserId!;
}

async function cleanTestData(): Promise<void> {
  await Schedule.destroy({ where: {}, truncate: true, cascade: true });
  await Task.destroy({ where: {}, truncate: true, cascade: true });
  await Subject.destroy({ where: { userId: testUserId }, truncate: true, cascade: true });
}

// Global setup
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: false, alter: true });
  await getTestToken();
});

// Clean up after each test
afterEach(async () => {
  await cleanTestData();
});

// Global teardown
afterAll(async () => {
  await cleanTestData();
  await sequelize.close();
});

export { getTestToken, getTestUserId };
