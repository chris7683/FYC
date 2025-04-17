import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useTheme } from '../context/ThemeContext'; // Import ThemeContext hook

const { width } = Dimensions.get('window');
type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, toggleTheme } = useTheme(); // Access theme and toggle function
  const [displayName, setDisplayName] = useState<string>('User');
  const [email, setEmail] = useState<string>('your.email@example.com');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        await user.reload(); // 🔄 Ensure latest user data
        setDisplayName(user.displayName || 'User');
        setEmail(user.email || 'your.email@example.com');
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Logout',
          onPress: async () => {
            try {
              await auth().signOut();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      <View style={[styles.headerContainer, theme === 'dark' && styles.darkHeader]}>
        <Text style={styles.headerText}>FYC Your Designated To-Do App</Text>
      </View>

      <View style={[styles.profileContainer, theme === 'dark' && styles.darkProfile]}>
        <Text style={[styles.profileName, theme === 'dark' && styles.darkText]}>{displayName}</Text>
        <Text style={[styles.profileEmail, theme === 'dark' && styles.darkText]}>{email}</Text>
      </View>

      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.optionRow}>
          <Text style={[styles.optionText, theme === 'dark' && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            thumbColor={theme === 'dark' ? '#4CAF50' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#81c784' }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleLogout}>
          <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  darkContainer: { backgroundColor: '#121212' },
  headerContainer: { width, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, backgroundColor: '#007bff' },
  darkHeader: { backgroundColor: '#1c1c1c' },
  headerText: { fontSize: width * 0.05, color: '#fff', fontWeight: 'bold' },
  profileContainer: { backgroundColor: '#fff', padding: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
  darkProfile: { backgroundColor: '#333' },
  profileName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  darkText: { color: '#f8f9fa' },
  profileEmail: { fontSize: 16, color: '#6c757d' },
  optionContainer: { padding: 20 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  optionText: { fontSize: 18 },
  logoutText: { color: '#d9534f', fontWeight: 'bold' },
});

export default SettingsScreen;
