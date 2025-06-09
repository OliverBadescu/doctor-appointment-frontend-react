import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../services/state/userState';
import { getAllPatientAppointments, deleteAppointment } from '../services/api/appointmentService';

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, appointmentDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="modal-content animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Cancel Appointment</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="warning-icon">
            ⚠️
          </div>
          <p className="modal-message">
            Are you sure you want to cancel your appointment?
          </p>
          {appointmentDetails && (
            <div className="appointment-summary">
              <div className="summary-item">
                <strong>Doctor:</strong> {appointmentDetails.doctor?.fullName || "Unknown Doctor"}
              </div>
              <div className="summary-item">
                <strong>Date:</strong> {new Date(appointmentDetails.start.replace(" ", "T")).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="summary-item">
                <strong>Time:</strong> {new Date(appointmentDetails.start.replace(" ", "T")).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </div>
            </div>
          )}
          <p className="modal-warning">
            This action cannot be undone.
          </p>
        </div>
        
        <div className="modal-footer">
          <button className="modal-button cancel-btn" onClick={onClose}>
            Keep Appointment
          </button>
          <button className="modal-button confirm-btn" onClick={onConfirm}>
            Yes, Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} animate-slideDown`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' ? '✅' : '❌'}
        </span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

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

  const showToast = (message, type) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const closeCancelModal = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await deleteAppointment(selectedAppointment.id);
      if (response.success) {
        setAppointments(appointments.filter(appointment => appointment.id !== selectedAppointment.id));
        showToast("Appointment cancelled successfully", "success");
      } else {
        showToast("Failed to cancel appointment. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      closeCancelModal();
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
    <>
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
            <button className="book-button animate-fadeIn">
              Book New Appointment
            </button>
          </Link>
        </div>
        
        <div className="dashboard-cards animate-fadeIn">
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
        
        <div className="appointments-section animate-fadeIn">
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
                        <button className="action-button reschedule-button animate-fadeIn">
                          Reschedule
                        </button>
                        <button
                          className="action-button cancel-button animate-fadeIn"
                          onClick={() => openCancelModal(appointment)}
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

      <CancelConfirmationModal
        isOpen={modalOpen}
        onClose={closeCancelModal}
        onConfirm={confirmCancelAppointment}
        appointmentDetails={selectedAppointment}
      />


      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />


    </>
  );
}