// jest/setup.js
import 'react-native-gesture-handler/jestSetup';

// Only mock NativeAnimatedHelper if the module actually resolves
let helperPath;
try {
  helperPath = require.resolve(
    'react-native/Libraries/Animated/NativeAnimatedHelper'
  );
} catch (e1) {
  try {
    helperPath = require.resolve(
      'react-native/Libraries/Animated/src/NativeAnimatedHelper'
    );
  } catch (e2) {
    helperPath = null;
  }
}

// If we found a valid path, mock it to silence useNativeDriver warnings
if (helperPath) {
  jest.mock(helperPath, () => ({}));
}

// Mock GestureHandlerRootView so navigation tests don’t crash
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    GestureHandlerRootView: ({ children }) => children,
  };
});
