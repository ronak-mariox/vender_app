module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-linear-gradient|react-native-svg|react-native-screens|react-native-safe-area-context)/)',
  ],
};
