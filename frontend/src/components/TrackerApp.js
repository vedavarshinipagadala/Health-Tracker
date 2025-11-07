// src/components/TrackerApp.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import TrackerList from './TrackerList';
import Login from './Login';
import Signup from './Signup';
import { HealthProvider } from '../context/HealthContext';

const TrackerApp = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignup = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogin(true);
  };

  const switchToSignup = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  // Show auth pages if not logged in
  if (!user) {
    return (
      <div className='main-container'>
        {showLogin ? (
          <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />
        ) : (
          <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    );
  }

  // Show main app if logged in
  return (
    <HealthProvider>
      <div className='main-container'>
        <Navbar user={user} onLogout={handleLogout} />
        <TrackerList />
      </div>
    </HealthProvider>
  );
};

export default TrackerApp;