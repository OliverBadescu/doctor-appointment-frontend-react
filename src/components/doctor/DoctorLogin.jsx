import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../services/state/userContext";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [providerCode, setProviderCode] = useState("");
  const { handleDoctorLogin, loading, errors } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loginRequest = {
      email,
      password,
      providerCode
    };
    
    const result = await handleDoctorLogin(loginRequest);
    
    if (result.success) {
      navigate("/doctor/dashboard");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
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
          <span className="logo-text animate-fadeIn">EasyApptCare</span>
        </Link>
        
        <div className="login-form-container animate-slideUp">
          <div className="welcome-section">
            <div className="welcome-title animate-fadeIn">Doctor Login</div>
            <div className="welcome-subtitle animate-fadeIn">
              Sign in to your provider account to manage patient appointments
            </div>
            {location.state?.message && (
              <div className="success-message animate-fadeIn">
                {location.state.message}
              </div>
            )}
          </div>
          
          <div className="form-wrapper">
            {errors.length > 0 && (
              <div className="error-message animate-fadeIn">
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group animate-slideUp">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            
              
              <div className="form-group animate-slideUp">
                <div className="password-header">
                  <label htmlFor="password" className="form-label">Password</label>
                  <Link 
                    to="/doctor/forgot-password"
                    className="forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className={`login-button ${loading ? 'loading' : ''} animate-fadeIn`}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
          
          <div className="signup-prompt animate-fadeIn">
            
            <p className="signup-text">
              Are you a patient?{" "}
              <Link to="/login" className="signup-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}