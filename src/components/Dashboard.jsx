import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


export default function Dashboard() {

  const [userName, setUserName] = useState('John Doe');
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      clinicName: 'Family Health Clinic',
      reason: 'Annual physical examination',
      date: '2025-04-15',
      time: '10:00 AM'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      clinicName: 'City Medical Center',
      reason: 'Follow-up consultation',
      date: '2025-04-22',
      time: '2:30 PM'
    }
  ]);

  const cancelAppointment = (id) => {
    
    setAppointments(appointments.filter(appointment => appointment.id !== id));
  };

  return (
    <div className="appointment-container">
      <div className="header-section">
        <div className="user-welcome">
          <h1 className="welcome-title">Welcome, {userName}</h1>
          <p className="welcome-subtitle">Manage your appointments and health records</p>
        </div>
        <Link to="/appointments/new">
          <button className="book-button">
            Book New Appointment
          </button>
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
        
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Health Records</div>
            <div className="card-description">Your medical records</div>
          </div>
          <div className="card-content">
            <div className="stat-value">3</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Medication Reminders</div>
            <div className="card-description">Active medication schedules</div>
          </div>
          <div className="card-content">
            <div className="stat-value">2</div>
          </div>
        </div>
      </div>
      
      <div className="appointments-section">
        <div className="section-header">
          <h2 className="section-title">Your Upcoming Appointments</h2>
        </div>
        
        {appointments.length > 0 ? (
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-layout">
                  <div className="appointment-details">
                    <div className="appointment-header">
                      <div>
                        <h3 className="doctor-name">{appointment.doctorName}</h3>
                        <p className="clinic-name">{appointment.clinicName}</p>
                      </div>
                      <div className="appointment-status">
                        <span className="status-badge">
                          Upcoming
                        </span>
                      </div>
                    </div>
                    <p className="appointment-reason">{appointment.reason}</p>
                    <div className="appointment-time-info">
                      <div className="time-detail">
                        <p className="detail-label">Date</p>
                        <p className="detail-value">
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="time-detail">
                        <p className="detail-label">Time</p>
                        <p className="detail-value">{appointment.time}</p>
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
            ))}
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