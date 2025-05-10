import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../services/state/userState';
import { getAllPatientAppointments, deleteAppointment } from '../services/api/appointmentService';

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
        const response = await deleteAppointment(id);
        if (response.success) {
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
    return (
      <div className="loading animate-fadeIn">
        Loading your appointments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message animate-fadeIn">
        {error}
      </div>
    );
  }

  return (
    <div className="appointment-container animate-fadeIn">
      <div className="header-section animate-slideUp">
        <div className="user-welcome">
          <h1 className="welcome-title animate-fadeIn">
            Welcome, {user.fullName}
          </h1>
          <p className="welcome-subtitle animate-fadeIn delay-50">
            Manage your appointments and health records
          </p>
        </div>
        <Link to="/appointments/new">
          <button className="book-button animate-fadeIn delay-100">
            Book New Appointment
          </button>
        </Link>
      </div>
      
      <div className="dashboard-cards animate-fadeIn delay-150">
        <div className="dashboard-card animate-slideUp">
          <div className="card-header">
            <div className="card-title">Upcoming Appointments</div>
            <div className="card-description">Your scheduled appointments</div>
          </div>
          <div className="card-content">
            <div className="stat-value">
              {appointments.length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="appointments-section animate-fadeIn delay-200">
        <div className="section-header">
          <h2 className="section-title">Your Upcoming Appointments</h2>
        </div>
        
        {appointments.length > 0 ? (
          <div className="appointment-list">
            {appointments.map((appointment, index) => {
              const startDate = new Date(appointment.start.replace(" ", "T"));
              const endDate = new Date(appointment.end.replace(" ", "T"));
              
  
              return (
                <div 
                  key={appointment.id} 
                  className={`appointment-card animate-slideUp`}
                >
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
                      <button className="action-button reschedule-button animate-fadeIn delay-300">
                        Reschedule
                      </button>
                      <button
                        className="action-button cancel-button animate-fadeIn delay-350"
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
          <div className="empty-appointments animate-fadeIn delay-200">
            <div className="empty-icon animate-fadeIn">

            </div>
            <h3 className="empty-title animate-fadeIn delay-50">
              No Appointments
            </h3>
            <p className="empty-message animate-fadeIn delay-100">
              You don't have any upcoming appointments.
            </p>
            <Link to="/appointments/new">
              <button className="book-button animate-slideUp delay-150">
                Book Your First Appointment
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
