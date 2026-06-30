import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../services/state/userState';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { handleRegister, loading, errors } = useContext(UserContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return; 
    }
    
    const registerRequest = {
      fullName: name,
      email,
      password
    };
    
    const success = await handleRegister(registerRequest);

    if (success) {
      navigate('/login', { state: { message: 'Înregistrare reușită! Te rugăm să te autentifici.' } });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <Link to="/" className="logo-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-icon animate-fadeIn"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="logo-text animate-fadeIn" >EasyApptCare</span>
        </Link>
        
        <div className="form-card">
          <div className="card-header">
            <div className="card-title animate-fadeIn">Creează un cont</div>
            <div className="card-description animate-fadeIn" >
              Înregistrează-te pentru a începe să faci programări medicale
            </div>
          </div>
          
          <div className="card-content">
            {errors.length > 0 && (
              <div className="error-message animate-fadeIn">
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group animate-slideUp">
                <label htmlFor="name" className="form-label">Nume complet</label>
                <input
                  id="name"
                  className="form-input"
                  placeholder="Ion Popescu"
                  value={name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group animate-slideUp" >
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group animate-slideUp" >
                <label htmlFor="password" className="form-label">Parolă</label>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group animate-slideUp" >
                <label htmlFor="confirmPassword" className="form-label">Confirmă parola</label>
                <input
                  id="confirmPassword"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                />
                {password !== confirmPassword && confirmPassword !== '' && (
                  <div className="password-mismatch animate-fadeIn">Parolele nu se potrivesc</div>
                )}
              </div>
              
              <button 
                type="submit" 
                className={`signup-button ${loading ? 'loading' : ''} animate-fadeIn`}
              
                disabled={loading || (password !== confirmPassword && confirmPassword !== '')}
              >
                {loading ? "Se creează contul..." : "Creează cont"}
              </button>
            </form>
          </div>
          
          <div className="card-footer animate-fadeIn" >
            <p className="login-prompt">
              Ai deja un cont?{" "}
              <Link to="/login" className="login-link">
                Autentifică-te
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}