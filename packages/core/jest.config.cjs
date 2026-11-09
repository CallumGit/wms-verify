/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@wms/types$': '<rootDir>/../types/src',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts'],
};
