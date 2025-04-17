import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CompletedScreen from './src/screens/CompletedTasksScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { TasksProvider } from './src/context/TasksContext'; // ✅ Add this import

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#333' : '#fff',
        },
        tabBarActiveTintColor: theme === 'dark' ? '#007bff' : '#007bff',
        tabBarInactiveTintColor: theme === 'dark' ? '#bbb' : '#6c757d',
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Completed" component={CompletedScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(auth().currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((authenticatedUser) => {
      console.log('User authentication status:', authenticatedUser);
      setUser(authenticatedUser);
      setLoading(false);
    });

    // Cleanup the subscription on unmount
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <TasksProvider> {/* ✅ Wrap the app in TasksProvider */}
        <NavigationContainer>
          {user ? <DashboardTabs /> : <AuthStack />}
        </NavigationContainer>
      </TasksProvider>
    </ThemeProvider>
  );
};

export default App;
