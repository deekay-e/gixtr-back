import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testMatch: ['<rootDir>/app/$1*/test/$1.ts'],
  collectCoverageFrom: ['<rootDir>/app/$1*/$1.ts', '!app/$1*/test/$1.ts?(x)', '!**/node_modules/$1*'],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1
    }
  },
  coverageReporters: ['text-summary', 'lcov'],
  moduleNameMapper: {
    '@auth/(.*)': ['<rootDir>/app/modules/auth/$1'],
    '@user/(.*)': ['<rootDir>/app/modules/users/$1'],
    '@global/(.*)': ['<rootDir>/app/common/globals/$1'],
    '@service/(.*)': ['<rootDir>/app/common/services/$1'],
    '@socket/(.*)': ['<rootDir>/app/common/sockets/$1'],
    '@worker/(.*)': ['<rootDir>/app/common/workers/$1'],
    '@/(.*)': ['<rootDir>/app/$1']
  }
}

export default config
