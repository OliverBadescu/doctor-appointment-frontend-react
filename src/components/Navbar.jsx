import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { UserContext } from "../services/state/userState";
import { DoctorContext } from "../services/state/doctorContext";

export default function Navbar() {
  const { user, handleLogout: handleUserLogout } = useContext(UserContext);
  const { doctor, handleLogout: handleDoctorLogout } = useContext(DoctorContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // AdminLayout renders its own AppBar + sidebar, so suppress the public
  // navbar on /admin/* to avoid two stacked headers.
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const isAdmin = user?.userRole === "ADMIN" && user?.id;
  const isClient = user?.id && !isAdmin;
  const isDoctor = Boolean(doctor?.jwtToken);

  const onUserLogoutClick = () => {
    handleUserLogout();
    navigate("/");
  };

  const logoTo = isAdmin
    ? "/admin/home"
    : isDoctor
    ? "/doctor/dashboard"
    : "/";

  const renderLinks = () => {
    if (isAdmin) {
      return (
        <>
          <Link to="/admin/clinics" className="animate-fadeIn">
            <Button variant="ghost">Clinici</Button>
          </Link>
          <Link to="/admin/doctors" className="animate-fadeIn">
            <Button variant="ghost">Doctori</Button>
          </Link>
          <Link to="/admin/patients" className="animate-fadeIn">
            <Button variant="ghost">Pacienți</Button>
          </Link>
          <Button onClick={onUserLogoutClick} className="animate-fadeIn">
            Deconectare
          </Button>
        </>
      );
    }

    if (isDoctor) {
      return (
        <>
          <Link to="/doctor/dashboard" className="animate-fadeIn">
            <Button variant="ghost">Panou de control</Button>
          </Link>
          <Button onClick={handleDoctorLogout} className="animate-fadeIn">
            Deconectare
          </Button>
        </>
      );
    }

    if (isClient) {
      return (
        <>
          <Link to="/appointment" className="animate-fadeIn">
            <Button variant="ghost">Programări</Button>
          </Link>
          <Link to="/appointments/new" className="animate-fadeIn">
            <Button variant="ghost">Programare nouă</Button>
          </Link>
          <Link to="/profile" className="animate-fadeIn">
            <Button variant="ghost">Profil</Button>
          </Link>
          <Button onClick={onUserLogoutClick} className="animate-fadeIn">
            Deconectare
          </Button>
        </>
      );
    }

    return (
      <>
        <Link to="/login" className="animate-fadeIn">
          <Button variant="ghost">Autentificare</Button>
        </Link>
        <Link to="/signup" className="animate-fadeIn">
          <Button variant="default" className="signup-btn">
            Înregistrare
          </Button>
        </Link>
      </>
    );
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-inner-container">
        <Link
          to={logoTo}
          className="logo-container"
          onClick={() => setMenuOpen(false)}
        >
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
          <span className="logo-bold animate-fadeIn">EasyApptCare</span>
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label="Comută meniul de navigare"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="26"
            height="26"
          >
            {menuOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        <div
          className={`login-container-navbar${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          {renderLinks()}
        </div>
      </div>
    </nav>
  );
}
