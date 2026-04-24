module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ✅ Required for react-native-vision-camera frame processors
    // ✅ Reanimated MUST always be last
    'react-native-reanimated/plugin',
  ],
};