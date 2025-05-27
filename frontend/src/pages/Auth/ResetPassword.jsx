import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../Dashboard.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    console.log('Reset password with token:', token);
  };

  return (
    <div className="dashboard-container">
      <div className="auth-form">
        <h1>Réinitialiser le mot de passe</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nouveau mot de passe:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Réinitialiser</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;