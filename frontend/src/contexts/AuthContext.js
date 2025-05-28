import React, { createContext, useState, useEffect, useContext } from 'react';

// Création du contexte d'authentification
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  forgotPassword: () => {},
  resetPassword: () => {},
  updateProfile: () => {},
  changePassword: () => {}
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Changé à false pour éviter les appels API
  
  // Fonction pour définir le token dans le local storage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };
  
  // Fonction de connexion (simulée pour éviter les erreurs d'API)
  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      // Simulation d'une connexion réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: '1',
        name: 'Utilisateur Test',
        email: email,
        role: 'Analyste'
      };
      
      const mockToken = 'mock-jwt-token';
      
      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    }
  };
  
  // Fonction d'inscription (simulée)
  const register = async (name, email, password) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: '1',
        name: name,
        email: email,
        role: 'Analyste'
      };
      
      const mockToken = 'mock-jwt-token';
      
      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Erreur lors de l\'inscription'
      };
    }
  };
  
  // Fonction de déconnexion
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Fonction pour réinitialiser le mot de passe (simulée)
  const forgotPassword = async (email) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
      return {
        success: true,
        message: 'Email de réinitialisation envoyé'
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      };
    }
  };
  
  // Fonction pour réinitialiser le mot de passe (simulée)
  const resetPassword = async (token, password) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Erreur lors de la réinitialisation'
      };
    }
  };
  
  // Fonction pour mettre à jour le profil (simulée)
  const updateProfile = async (userData) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({ ...user, ...userData });
      
      setIsLoading(false);
      return {
        success: true,
        message: 'Profil mis à jour avec succès'
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour'
      };
    }
  };
  
  // Fonction pour changer le mot de passe (simulée)
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
      return {
        success: true,
        message: 'Mot de passe changé avec succès'
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Erreur lors du changement de mot de passe'
      };
    }
  };
  
  // Valeur du contexte
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export du contexte
export { AuthContext };
export default AuthContext;