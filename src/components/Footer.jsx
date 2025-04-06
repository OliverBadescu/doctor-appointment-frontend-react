import { Link } from "react-router-dom";

export default function Footer(){
    const currentYear = new Date().getFullYear();

    return(

        <footer className="footer-container">
            <div className="copyright-container">
                <p>&copy; {currentYear} EasyApptCare. All rights reserved.</p>
            </div>
            <div className="links-footer">
                <Link className="link-footer"> Privacy Policy</Link>
                <Link className="link-footer"> Terms of Service</Link>
                <Link className="link-footer"> Contact Us</Link>
            </div>
        </footer>
    );
}


