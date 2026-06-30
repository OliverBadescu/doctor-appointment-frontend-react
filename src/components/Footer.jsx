import { Link } from "react-router-dom";
import { UserContext } from "../services/state/userState";
import { useContext } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, handleLogout } = useContext(UserContext);

  return (
    <footer className={user.userRole === "ADMIN" ? "footer-none" : "footer-container"} >
      <div className="copyright-container">
        <p className="animate-fadeIn">&copy; {currentYear} EasyApptCare. Toate drepturile rezervate.</p>
      </div>
      <div className="links-footer">
        <Link className="link-footer animate-fadeIn"> Politica de confidențialitate</Link>
        <Link className="link-footer animate-fadeIn" > Termeni și condiții</Link>
        <Link className="link-footer animate-fadeIn"> Contactează-ne</Link>
      </div>
    </footer>
  );
} 