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
  testMatch: ['<rootDir>/app/**/tests/*.ts'],
  collectCoverageFrom: ['app/**/*.ts', '!app/**/tests/*.ts?(x)', '!**/node_modules/**'],
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
    '@chat/(.*)': ['<rootDir>/app/modules/chats/$1'],
    '@comment/(.*)': ['<rootDir>/app/modules/comments/$1'],
    '@follower/(.*)': ['<rootDir>/app/modules/followers/$1'],
    '@image/(.*)': ['<rootDir>/app/modules/images/$1'],
    '@notification/(.*)': ['<rootDir>/app/modules/notifications/$1'],
    '@post/(.*)': ['<rootDir>/app/modules/posts/$1'],
    '@reaction/(.*)': ['<rootDir>/app/modules/reactions/$1'],
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
