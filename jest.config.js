module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: [
      "/node_modules/",
      "/public/",
      "/vendor/"
  ],
  moduleNameMapper: {
      "\\.(css)$": "<rootDir>/resources/js/__mocks__/styleMock.js"
  },
  transformIgnorePatterns: [
    "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)"
  ],
  setupFiles: ['@testing-library/react/dont-cleanup-after-each'],
  testEnvironment: 'jsdom',
}