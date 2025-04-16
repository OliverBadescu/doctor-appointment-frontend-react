import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { UserContext } from "../services/state/userContext";

export default function Navbar() {
  const { user, handleLogout } = useContext(UserContext);
  const navigate = useNavigate();
  
  const isLoggedIn = user && user.id !== 0;
  
  const onLogoutClick = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-inner-container">
        <Link to="/" className="logo-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-medical-600 animate-fadeIn"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="logo-bold animate-fadeIn" style={{ animationDelay: "100ms" }}>EasyApptCare</span>
        </Link>

        <div className="login-container-navbar">
          {isLoggedIn ? (
            <>
              {user.userRole === "ADMIN" && (
                <Link to="/admin/appointment" className="animate-fadeIn">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <Link to="/appointment" className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/appointments/new" className="animate-fadeIn" style={{ animationDelay: "200ms" }}>
                <Button variant="ghost">New Appointment</Button>
              </Link>
              <Button onClick={onLogoutClick} className="animate-fadeIn" style={{ animationDelay: "300ms" }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="animate-fadeIn">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup" className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
                <Button variant="default" className="signup-btn">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}