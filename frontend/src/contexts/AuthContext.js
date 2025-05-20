import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Fonction pour définir le token dans le local storage et les headers d'Axios
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };
  
  // Vérifier l'authentification de l'utilisateur au chargement
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (token) {
        setToken(token);
        
        try {
          const response = await axios.get('/api/v1/auth/me');
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Authentication error:', error);
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Fonction de connexion
  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      
      let message = 'An error occurred during login';
      
      if (error.response) {
        message = error.response.data.message || message;
      }
      
      return {
        success: false,
        message
      };
    }
  };
  
  // Fonction d'inscription
  const register = async (name, email, password) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/v1/auth/register', {
        name,
        email,
        password
      });
      
      const { token } = response.data;
      
      setToken(token);
      
      // Récupérer les informations de l'utilisateur après l'inscription
      const userResponse = await axios.get('/api/v1/auth/me');
      setUser(userResponse.data.data);
      setIsAuthenticated(true);
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      
      let message = 'An error occurred during registration';
      
      if (error.response) {
        message = error.response.data.message || message;
        
        if (error.response.data.errors) {
          message = error.response.data.errors.map(err => err.msg).join(', ');
        }
      }
      
      return {
        success: false,
        message
      };
    }
  };
  
  // Fonction de déconnexion
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Fonction pour réinitialiser le mot de passe (étape 1)
  const forgotPassword = async (email) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/v1/auth/forgot-password', {
        email
      });
      
      setIsLoading(false);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      setIsLoading(false);
      
      let message = 'An error occurred during password reset request';
      
      if (error.response) {
        message = error.response.data.message || message;
      }
      
      return {
        success: false,
        message
      };
    }
  };
  
  // Fonction pour réinitialiser le mot de passe (étape 2)
  const resetPassword = async (token, password) => {
    setIsLoading(true);
    
    try {
      const response = await axios.put(`/api/v1/auth/reset-password/${token}`, {
        password
      });
      
      setIsLoading(false);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      setIsLoading(false);
      
      let message = 'An error occurred during password reset';
      
      if (error.response) {
        message = error.response.data.message || message;
      }
      
      return {
        success: false,
        message
      };
    }
  };
  
  // Fonction pour mettre à jour le profil
  const updateProfile = async (userData) => {
    setIsLoading(true);
    
    try {
      const response = await axios.put('/api/v1/auth/update-profile', userData);
      
      setUser(response.data.data);
      
      setIsLoading(false);
      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      setIsLoading(false);
      
      let message = 'An error occurred during profile update';
      
      if (error.response) {
        message = error.response.data.message || message;
      }
      
      return {
        success: false,
        message
      };
    }
  };
  
  // Fonction pour changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    
    try {
      const response = await axios.put('/api/v1/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      setIsLoading(false);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      setIsLoading(false);
      
      let message = 'An error occurred during password change';
      
      if (error.response) {
        message = error.response.data.message || message;
      }
      
      return {
        success: false,
        message
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

export default AuthContext;