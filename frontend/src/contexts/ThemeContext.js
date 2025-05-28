import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Récupérer le thème sauvegardé ou utiliser la préférence système
    const savedTheme = localStorage.getItem('cyberthreat-atlas-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Détecter la préférence système
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  useEffect(() => {
    // Appliquer le thème à l'élément racine
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Sauvegarder la préférence
    localStorage.setItem('cyberthreat-atlas-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const contextValue = {
    isDarkMode,
    toggleDarkMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;