import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../services/state/userContext';
import { getAllPatientAppointments } from '../services/api/appointmentService';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.id === 0) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await getAllPatientAppointments(user.id);
        if (response.success) {
          // Expecting appointments to be an array of appointment objects
          setAppointments(response.body.appointments || []);
        } else {
          setError("Failed to load appointments");
          console.error("Error fetching appointments:", response.message);
        }
      } catch (err) {
        setError("An error occurred while fetching appointments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, navigate]);

  const cancelAppointment = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const response = await fetch(`http://www.localhost:8080/appointment/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.jwtToken}`
          }
        });

        if (response.ok) {
          setAppointments(appointments.filter(appointment => appointment.id !== id));
        } else {
          alert("Failed to cancel appointment. Please try again.");
        }
      } catch (error) {
        console.error("Error canceling appointment:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading your appointments...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="appointment-container">
      <div className="header-section">
        <div className="user-welcome">
          <h1 className="welcome-title">Welcome, {user.fullName}</h1>
          <p className="welcome-subtitle">Manage your appointments and health records</p>
        </div>
        <Link to="/appointments/new">
          <button className="book-button">Book New Appointment</button>
        </Link>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Upcoming Appointments</div>
            <div className="card-description">Your scheduled appointments</div>
          </div>
          <div className="card-content">
            <div className="stat-value">{appointments.length}</div>
          </div>
        </div>
        
    
      </div>
      
      <div className="appointments-section">
        <div className="section-header">
          <h2 className="section-title">Your Upcoming Appointments</h2>
        </div>
        
        {appointments.length > 0 ? (
          <div className="appointment-list">
            {appointments.map((appointment) => {
              
              const startDate = new Date(appointment.start.replace(" ", "T"));
              const endDate = new Date(appointment.end.replace(" ", "T"));
              return (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-layout">
                    <div className="appointment-details">
                      <div className="appointment-header">
                        <div>
                          <h3 className="doctor-name">
                            {appointment.doctor?.fullName || "Unknown Doctor"}
                          </h3>
                          <p className="clinic-name">
                           
                            Medical Center
                          </p>
                        </div>
                        <div className="appointment-status">
                          <span className="status-badge">Upcoming</span>
                        </div>
                      </div>
                      <p className="appointment-reason">
                        {appointment.reason || "No reason provided"}
                      </p>
                      <div className="appointment-time-info">
                        <div className="time-detail">
                          <p className="detail-label">Date</p>
                          <p className="detail-value">
                            {startDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="time-detail">
                          <p className="detail-label">Time</p>
                          <p className="detail-value">
                            {startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="appointment-actions">
                      <button className="action-button reschedule-button">
                        Reschedule
                      </button>
                      <button
                        className="action-button cancel-button"
                        onClick={() => cancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-appointments">
            <div className="empty-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <h3 className="empty-title">No Appointments</h3>
            <p className="empty-message">You don't have any upcoming appointments.</p>
            <Link to="/appointments/new">
              <button className="book-button">
                Book Your First Appointment
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
