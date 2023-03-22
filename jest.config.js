/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./**/*.{ts,js}'],
  moduleFileExtensions: ['js', 'ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
