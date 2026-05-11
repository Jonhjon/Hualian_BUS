import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
  // jose and other ESM-only packages must not be excluded from transformation
  transformIgnorePatterns: ['/node_modules/(?!(jose)/)'],
  coverageThreshold: { global: { lines: 80 } },
}

export default createJestConfig(config)
