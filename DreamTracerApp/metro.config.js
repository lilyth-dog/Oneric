const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    // 번들 크기 최적화를 위한 설정
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
    // 이미지 최적화
    assetPlugins: ['react-native-svg-transformer'],
  },
  resolver: {
    // 불필요한 파일 제외
    blacklistRE: /(.*\/__tests__\/.*|.*\/__mocks__\/.*|.*\.test\.(js|ts|tsx)|.*\.spec\.(js|ts|tsx))$/,
    // 확장자 우선순위 설정
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'svg'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mp3', 'wav', 'm4a', 'ttf', 'otf', 'woff', 'woff2'],
  },
  serializer: {
    // 번들 크기 최적화
    createModuleIdFactory: function () {
      return function (path) {
        // 모듈 ID를 해시로 변환하여 크기 줄이기
        let name = path.substr(path.lastIndexOf('/') + 1);
        name = name.replace(/\.[^/.]+$/, '');
        return name;
      };
    },
  },
  // 캐시 최적화
  cacheStores: [
    {
      name: 'metro-cache',
    },
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
