import { Link } from "react-router-dom";
import {Button} from "antd";

export default function Home(){

    


    return(

    <>


    
        <section className="aside-container">
            <div className="aside-main-container">
                <div className="book-appointment-container">
                    <h1 className="h1-tag-aside"> Book Your Medical Appointments with Ease </h1>

                    <p className="description-aside">EasyApptCare lets you schedule appointments with your preferred doctors and clinics in just a few clicks. No more waiting on hold.</p>
                    <Button className="book-appointment-button">
                        Book an Appointment
                    </Button>
                </div>

                
                <div className="image-conatiner-aside">
                    <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="doctor" />
                </div>
            </div>
        </section>

        <section className="features-section">

            <h1 className="features-h1">Why Choose EasyApptCare?</h1>

            <div className="features-cards">
               <div className="easy-scheduling card">
                    <i class="fa-regular fa-clipboard"></i>
                    <h5 className="light-blue-features">Easy Scheduling</h5>
                    <p className="grey-text-features">Book appointments with your preferred doctors and clinics in just a few clicks.</p>
               </div>
               <div className="health-tracking card">
                    <i class="fa-solid fa-heart-pulse"></i>
                    <h5 className="light-blue-features">Health Tracking</h5>
                    <p className="grey-text-features">Keep track of your medical history and appointments in one place.</p>
               </div>
               <div className="reminders card">
                    <i class="fa-regular fa-bell"></i>
                    <h5 className="light-blue-features">Reminders</h5>
                    <p className="grey-text-features">Get timely reminders for your upcoming appointments, never miss a visit.</p>
               </div>
            </div>
        </section>

        <section className="signup-now-container">
            <h1 className="h1-signup">Ready to take control of your healthcare?</h1>
            <p className="p-signup"> Join thousands of patients who have simplified their healthcare journey.</p>
            <Button className="sign-up-now-btn">Sign Up Now</Button>
        </section>
    </>

    );


}