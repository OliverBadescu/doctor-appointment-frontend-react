import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { UserContext } from "../services/state/userState";
import "../animations.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const isLoggedIn = user && user.id !== 0;

  const handleBookAppointment = () => {
    if (isLoggedIn) {
      navigate("/appointments/new");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <section className="aside-container animate-fadeIn">
        <div className="aside-main-container">
          <div className="book-appointment-container">
            <h1 className="h1-tag-aside animate-slideUp">
              Programează-ți consultațiile medicale cu ușurință
            </h1>
            <p className="description-aside animate-slideUp">
              EasyApptCare îți permite să programezi consultații la doctorii și
              clinicile preferate în doar câteva clickuri. Fără așteptări la telefon.
            </p>
            <Button
              className="book-appointment-button animate-slideUp"
              onClick={handleBookAppointment}
            >
              Fă o programare
            </Button>
          </div>
          <div className="image-conatiner-aside animate-fadeIn">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="doctor"
            />
          </div>
        </div>
      </section>

      <section className="features-section animate-fadeIn">
        <h1 className="features-h1 animate-slideUp">De ce să alegi EasyApptCare?</h1>
        <div className="features-cards">
          <div className="easy-scheduling card animate-slideUp">
            <i className="fa-regular fa-clipboard"></i>
            <h5 className="light-blue-features">Programare ușoară</h5>
            <p className="grey-text-features">
              Programează-te la doctorii și clinicile preferate în doar câteva
              clickuri.
            </p>
          </div>
          <div className="health-tracking card animate-slideUp">
            <i className="fa-solid fa-heart-pulse"></i>
            <h5 className="light-blue-features">Monitorizarea sănătății</h5>
            <p className="grey-text-features">
              Ține evidența istoricului medical și a programărilor într-un singur loc.
            </p>
          </div>
          <div className="reminders card animate-slideUp">
            <i className="fa-regular fa-bell"></i>
            <h5 className="light-blue-features">Memento-uri</h5>
            <p className="grey-text-features">
              Primește memento-uri la timp pentru programările tale viitoare, ca să
              nu ratezi nicio vizită.
            </p>
          </div>
        </div>
      </section>

      {!isLoggedIn && (
        <section className="signup-now-container animate-fadeIn">
          <h1 className="h1-signup animate-slideUp">
            Ești gata să preiei controlul sănătății tale?
          </h1>
          <p className="p-signup animate-slideUp">
            Alătură-te miilor de pacienți care și-au simplificat experiența medicală.
          </p>
          <Button
            className="sign-up-now-btn animate-slideUp"
            onClick={() => navigate("/signup")}
          >
            Înregistrează-te acum
          </Button>
        </section>
      )}
    </>
  );
}
