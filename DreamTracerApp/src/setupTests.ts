// Jest 테스트 설정
import 'react-native-gesture-handler/jestSetup';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock Lottie
jest.mock('lottie-react-native', () => 'LottieView');

// Mock calendar
jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
  CalendarList: 'CalendarList',
  Agenda: 'Agenda',
}));

// Mock SVG
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  G: 'G',
}));
