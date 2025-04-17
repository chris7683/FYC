import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, 
  Platform, ScrollView, Alert, ActivityIndicator, Animated
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const PRIMARY_COLOR = '#007BFF';
const INPUT_BORDER_COLOR = '#ccc';
const BACKGROUND_COLOR = '#F0F4F8';
const ERROR_COLOR = '#FF0000';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  // Auto-login if user is already authenticated
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            navigation.replace('Dashboard');
          }
        } catch (error) {
          console.error('Error checking user in Firestore:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [fadeAnim]);

  const validateInputs = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Please enter your email address.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        throw new Error('User profile not found. Please sign up again.');
      }

      navigation.replace('Dashboard');
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Try again later.';
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            onError={() => console.warn('Logo image not found!')}
            defaultSource={require('../../assets/fallback-logo.png')} // Fallback logo
          />

          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Manage your tasks efficiently</Text>

          <TextInput 
            placeholder="Email" 
            style={[styles.input, emailError && styles.errorInput]} 
            keyboardType="email-address" 
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TextInput 
            ref={passwordRef}
            placeholder="Password" 
            style={[styles.input, passwordError && styles.errorInput]} 
            secureTextEntry 
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    padding: 12,
    borderWidth: 1,
    borderColor: INPUT_BORDER_COLOR,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorInput: {
    borderColor: ERROR_COLOR,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  forgotPassword: {
    color: PRIMARY_COLOR,
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 20,
    fontSize: 14,
    color: '#333',
  },
  signupLink: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
});
