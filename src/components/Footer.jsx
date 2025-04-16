import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="copyright-container">
        <p>&copy; {currentYear} EasyApptCare. All rights reserved.</p>
      </div>
      <div className="links-footer">
        <Link className="link-footer animate-fadeIn"> Privacy Policy</Link>
        <Link className="link-footer animate-fadeIn" style={{ animationDelay: "100ms" }}> Terms of Service</Link>
        <Link className="link-footer animate-fadeIn" style={{ animationDelay: "200ms" }}> Contact Us</Link>
      </div>
    </footer>
  );
}