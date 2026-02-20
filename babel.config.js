module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin must be last; it includes worklets (do not add react-native-worklets/plugin separately)
      'react-native-reanimated/plugin',
    ],
  };
};
