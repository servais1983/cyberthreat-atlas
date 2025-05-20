import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import des composants de mise en page
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Import des pages principales
import Dashboard from './pages/Dashboard';
import GroupsList from './pages/GroupsList';
import GroupDetail from './pages/GroupDetail';
import TechniquesList from './pages/TechniquesList';
import TechniqueDetail from './pages/TechniqueDetail';
import CampaignsList from './pages/CampaignsList';
import CampaignDetail from './pages/CampaignDetail';
import MalwaresList from './pages/MalwaresList';
import MalwareDetail from './pages/MalwareDetail';
import WorldMap from './pages/WorldMap';
import RelationshipsGraph from './pages/RelationshipsGraph';
import Timeline from './pages/Timeline';
import NotFound from './pages/NotFound';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Profile from './pages/Auth/Profile';

// Import des services et contextes
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Simuler le chargement initial de l'application
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Chargement de CyberThreat Atlas...</p>
      </div>
    );
  }
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Header toggleSidebar={toggleSidebar} />
            
            <div className="app-main">
              <Sidebar isOpen={sidebarOpen} />
              
              <main className={`content-area ${sidebarOpen ? '' : 'content-expanded'}`}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Routes pour les groupes d'attaque */}
                  <Route path="/groups" element={<GroupsList />} />
                  <Route path="/groups/:id" element={<GroupDetail />} />
                  
                  {/* Routes pour les techniques */}
                  <Route path="/techniques" element={<TechniquesList />} />
                  <Route path="/techniques/:id" element={<TechniqueDetail />} />
                  
                  {/* Routes pour les campagnes */}
                  <Route path="/campaigns" element={<CampaignsList />} />
                  <Route path="/campaigns/:id" element={<CampaignDetail />} />
                  
                  {/* Routes pour les malwares */}
                  <Route path="/malware" element={<MalwaresList />} />
                  <Route path="/malware/:id" element={<MalwareDetail />} />
                  
                  {/* Routes pour les visualisations */}
                  <Route path="/map" element={<WorldMap />} />
                  <Route path="/relationships" element={<RelationshipsGraph />} />
                  <Route path="/timeline" element={<Timeline />} />
                  
                  {/* Routes d'authentification */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  
                  {/* Route 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;