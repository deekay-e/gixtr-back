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
  testMatch: ['<rootDir>/app/**/test/*.ts'],
  collectCoverageFrom: ['app/**/*.ts', '!app/**/test/*.ts?(x)', '!**/node_modules/**'],
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
    '@mock/(.*)': ['<rootDir>/app/mocks/$1'],
    '@/(.*)': ['<rootDir>/app/$1']
  }
}

export default config
