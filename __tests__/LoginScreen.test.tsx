import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Mock Firebase Auth
const mockSignIn = jest.fn();
const mockOnAuthStateChanged = jest.fn(() => () => {});

jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: mockSignIn,
    onAuthStateChanged: mockOnAuthStateChanged,
  });
});

// Mock Firebase Firestore
jest.mock('@react-native-firebase/firestore', () => {
  return () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: true })),
      })),
    })),
  });
});

// Mock navigation prop
const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
};

describe('LoginScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all input fields and buttons correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
  });

  it('shows error messages if fields are empty', async () => {
    const { getByText, queryByText } = render(<LoginScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(queryByText('Please enter your email address.')).toBeTruthy();
      expect(queryByText('Please enter your password.')).toBeTruthy();
    });
  });

  it('calls signInWithEmailAndPassword and navigates to Dashboard on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: 'testuid' } });

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigation.replace).toHaveBeenCalledWith('Dashboard');
    });
  });
});
