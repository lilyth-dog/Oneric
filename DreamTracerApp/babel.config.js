module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 번들 크기 최적화를 위한 플러그인들
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@stores': './src/stores',
          '@types': './src/types',
          '@styles': './src/styles',
          '@assets': './assets',
        },
      },
    ],
    // 불필요한 코드 제거
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
  env: {
    production: {
      plugins: [
        // 프로덕션에서만 적용되는 최적화
        'transform-remove-console',
        ['transform-remove-debugger'],
      ],
    },
  },
};
