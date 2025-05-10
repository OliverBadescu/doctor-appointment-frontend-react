import { Link } from "react-router-dom";
import { UserContext } from "../services/state/userState";
import { useContext } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, handleLogout } = useContext(UserContext);

  return (
    <footer className={user.userRole === "ADMIN" ? "footer-none" : "footer-container"} >
      <div className="copyright-container">
        <p className="animate-fadeIn">&copy; {currentYear} EasyApptCare. All rights reserved.</p>
      </div>
      <div className="links-footer">
        <Link className="link-footer animate-fadeIn"> Privacy Policy</Link>
        <Link className="link-footer animate-fadeIn" > Terms of Service</Link>
        <Link className="link-footer animate-fadeIn"> Contact Us</Link>
      </div>
    </footer>
  );
} 