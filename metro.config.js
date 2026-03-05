const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const sdkPath = path.resolve(__dirname, '../movement-sdk-react-native');
config.watchFolders = [sdkPath];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];
config.resolver.extraNodeModules = {
  '@foursquare/movement-sdk-react-native': sdkPath,
};

module.exports = config;
