// src/components/Navbar.js
import React, { useState } from 'react';
import HealthForm from './HealthForm';

const Navbar = ({ user, onLogout }) => {
  const [showForm, setShowForm] = useState(false);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div className="nav">
      <h1>💪 Health Tracker</h1>
      {user && (
        <div className="user-info">
          <p>Welcome, <strong>{user.username}</strong>! 👋</p>
        </div>
      )}
      <div className="nav-buttons">
        <button onClick={handleAddClick} className="custom-button">
          ➕ Add Today's Data
        </button>
        {user && (
          <button onClick={onLogout} className="logout-button">
            🚪 Logout
          </button>
        )}
      </div>
      
      {showForm && <HealthForm onClose={handleCloseForm} />}
    </div>
  );
};

export default Navbar;