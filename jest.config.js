module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest/setup.js'], // Add custom setup.js
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js', // Mock image files
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|@react-navigation' +
      '|react-navigation' +
      '|react-native-gesture-handler' + // Include this to prevent transform issues with gesture handler
      ')/)', 
  ],
};
