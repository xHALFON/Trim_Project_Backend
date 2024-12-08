export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/tests//*.test.js'], // Match all test files
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/*.js',
    'middleware/*.js',
    'routes/*.js',
    'models/*.js',
  ],
  maxWorkers: 1, // הפעלת הבדיקות בעבודה אחת בלבד
};
