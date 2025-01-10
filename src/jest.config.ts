export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/tests//*.test.ts'], // Match all test files
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/*.ts',
    'middleware/*.ts',
    'routes/*.ts',
    'models/*.ts',
  ],
  maxWorkers: 1, // הפעלת הבדיקות בעבודה אחת בלבד
};
