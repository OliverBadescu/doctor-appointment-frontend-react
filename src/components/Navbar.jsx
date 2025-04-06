import { Link } from "react-router-dom";
import {Button} from "antd";

export default function Navbar(){


    const isLoggedIn = false;


    return(
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
                        className="h-6 w-6 text-medical-600"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <span className="logo-bold">EasyApptCare</span>
                </Link>

                <div className="login-container">
                    {isLoggedIn ? (
                        <>
                            <Link to="">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Link to="">
                                <Button variant="ghost">New Appointment</Button>
                            </Link>
                            <Button

                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button variant="default" className="signup-btn">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )

}