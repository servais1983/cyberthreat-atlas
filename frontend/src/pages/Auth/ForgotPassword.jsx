import React, { useState } from 'react';
import '../Dashboard.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Forgot password for:', email);
  };

  return (
    <div className="dashboard-container">
      <div className="auth-form">
        <h1>Mot de passe oublié</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Envoyer le lien</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;