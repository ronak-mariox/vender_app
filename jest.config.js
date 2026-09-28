module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@react-native-async-storage|@react-native-community|react-native-linear-gradient|react-native-svg|react-native-screens|react-native-safe-area-context|react-native-image-picker)/)',
  ],
};
