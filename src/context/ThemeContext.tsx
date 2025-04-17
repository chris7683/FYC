import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

// Define types for the theme and the context value
type Theme = 'light' | 'dark';
type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

// Create the context with default values
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

// Custom hook to use ThemeContext
export const useTheme = () => useContext(ThemeContext);

// Provider component to manage theme state and provide the context to children
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = Appearance.getColorScheme() || 'light';
  const [theme, setTheme] = useState<Theme>(systemTheme);

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => listener.remove();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
