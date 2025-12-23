const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    // 번들 크기 최적화를 위한 설정
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
    // SVG 변환기 설정
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // SVG를 assetExts에서 제거하고 sourceExts에 추가
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    // 불필요한 파일 제외
    blacklistRE: /(.*\/__tests__\/.*|.*\/__mocks__\/.*|.*\.test\.(js|ts|tsx)|.*\.spec\.(js|ts|tsx))$/,
  },

};

module.exports = mergeConfig(defaultConfig, config);

