import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../services/state/userState';
import { getAllPatientAppointments, deleteAppointment } from '../services/api/appointmentService';
import { addReview } from '../services/api/reviewService'; 

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, appointmentDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="modal-content animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Anulează programarea</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="warning-icon">
            ⚠️
          </div>
          <p className="modal-message">
            Sigur dorești să anulezi programarea?
          </p>
          {appointmentDetails && (
            <div className="appointment-summary">
              <div className="summary-item">
                <strong>Doctor:</strong> {appointmentDetails.doctor?.fullName || "Doctor necunoscut"}
              </div>
              <div className="summary-item">
                <strong>Dată:</strong> {new Date(appointmentDetails.start.replace(" ", "T")).toLocaleDateString('ro-RO', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="summary-item">
                <strong>Oră:</strong> {new Date(appointmentDetails.start.replace(" ", "T")).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </div>
            </div>
          )}
          <p className="modal-warning">
            Această acțiune nu poate fi anulată.
          </p>
        </div>
        
        <div className="modal-footer">
          <button className="modal-button cancel-btn" onClick={onClose}>
            Păstrează programarea
          </button>
          <button className="modal-button confirm-btn" onClick={onConfirm}>
            Da, anulează programarea
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, onSubmit, appointmentDetails }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert('Te rugăm să selectezi o evaluare');
      return;
    }
    if (title.trim() === '') {
      alert('Te rugăm să introduci un titlu pentru recenzie');
      return;
    }
    const reviewData = {
      description: description.trim(), 
      title: title.trim(),
      rating,
      userId: appointmentDetails?.user.id,
      doctorId: appointmentDetails?.doctor?.id,
    };

    onSubmit(reviewData);
    

    setRating(0);
    setHoveredRating(0);
    setTitle('');
    setDescription('');
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setTitle('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fadeIn" onClick={handleClose}>
      <div className="modal-content review-modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Lasă o recenzie</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {appointmentDetails && (
            <div className="doctor-info">
              <h4 className="doctor-review-name">
                {appointmentDetails.doctor?.fullName || "Doctor necunoscut"}
              </h4>
              <p className="appointment-date">
                Programare pe {new Date(appointmentDetails.start.replace(" ", "T")).toLocaleDateString('ro-RO', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          <div className="review-form">
            <div className="form-group">
              <label className="form-label">Evaluare *</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hoveredRating || rating) ? 'star-filled' : 'star-empty'}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating > 0 && (
                  <span>
                    {rating === 1 && "Slab"}
                    {rating === 2 && "Acceptabil"}
                    {rating === 3 && "Bun"}
                    {rating === 4 && "Foarte bun"}
                    {rating === 5 && "Excelent"}
                  </span>
                )}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="review-title">Titlul recenziei *</label>
              <input
                id="review-title"
                type="text"
                className="form-input"
                placeholder="Rezumă experiența ta..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="character-count">{title.length}/100</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="review-description">Descriere (Opțional)</label>
              <textarea
                id="review-description"
                className="form-textarea"
                placeholder="Spune-ne mai multe despre experiența ta cu acest doctor..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="character-count">{description.length}/500</p>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-button cancel-btn" onClick={handleClose}>
            Anulează
          </button>
          <button
            className="modal-button confirm-btn"
            onClick={handleSubmitReview}
            disabled={rating === 0 || title.trim() === ''}
          >
            Trimite recenzia
          </button>
        </div>
      </div>
    </div>
  );
};

// New Success Modal Component
const ReviewSuccessModal = ({ isOpen, onClose, doctorName, rating }) => {
  if (!isOpen) return null;

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return "Slab";
      case 2: return "Acceptabil";
      case 3: return "Bun";
      case 4: return "Foarte bun";
      case 5: return "Excelent";
      default: return "";
    }
  };

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="modal-content success-modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Recenzie trimisă cu succes!</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="success-icon">
            ✅
          </div>
          <div className="success-content">
            <h4 className="success-title">Îți mulțumim pentru feedback!</h4>
            <p className="success-message">
              Recenzia ta pentru <strong>{doctorName}</strong> a fost trimisă cu succes.
            </p>
            <div className="review-summary">
              <div className="submitted-rating">
                <span className="rating-label">Evaluarea ta:</span>
                <div className="rating-display">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`star ${star <= rating ? 'star-filled' : 'star-empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">({getRatingText(rating)})</span>
                </div>
              </div>
            </div>
            <p className="success-note">
              Recenzia ta îi va ajuta pe alți pacienți să ia decizii informate despre sănătatea lor.
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-button confirm-btn success-btn" onClick={onClose}>
            Excelent!
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
  const { user, isAuthReady } = useContext(UserContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submittedReview, setSubmittedReview] = useState(null); 
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

  useEffect(() => {
    if (!isAuthReady) return;

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
          setError("Încărcarea programărilor a eșuat");
          console.error("Error fetching appointments:", response.message);
        }
      } catch (err) {
        setError("A apărut o eroare la încărcarea programărilor");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, navigate, isAuthReady]);

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
        showToast("Programare anulată cu succes", "success");
      } else {
        showToast("Anularea programării a eșuat. Te rugăm să încerci din nou.", "error");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      showToast("A apărut o eroare. Te rugăm să încerci din nou.", "error");
    } finally {
      closeCancelModal();
    }
  };

  const handleLeaveReview = (appointment) => {
    setSelectedAppointment(appointment);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedAppointment(null);
  };

  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
    setSubmittedReview(null);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await addReview(reviewData);
      
      if (response.success) {
        // Store review data for success modal
        setSubmittedReview({
          doctorName: selectedAppointment?.doctor?.fullName || "Doctor necunoscut",
          rating: reviewData.rating
        });
        
        // Close review modal first
        closeReviewModal();
        
        // Show success modal
        setSuccessModalOpen(true);
      } else {
        showToast(response.message || "Trimiterea recenziei a eșuat. Te rugăm să încerci din nou.", "error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("A apărut o eroare la trimiterea recenziei. Te rugăm să încerci din nou.", "error");
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return { text: 'Finalizată', className: 'status-completed' };
      case 'CANCELLED':
        return { text: 'Anulată', className: 'status-cancelled' };
      case 'SCHEDULED':
        return { text: 'Viitoare', className: 'status-upcoming' };
      default:
        return { text: 'Viitoare', className: 'status-upcoming' };
    }
  };

  const isAppointmentCompleted = (appointment) => {
    return appointment.status?.toUpperCase() === 'COMPLETED';
  };

  const canCancelAppointment = (appointment) => {
    const status = appointment.status?.toUpperCase();
    return status !== 'COMPLETED' && status !== 'CANCELLED';
  };

  if (loading) {
    return (
      <div className="loading animate-fadeIn">
        Se încarcă programările tale...
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
              Bun venit, {user.fullName}
            </h1>
            <p className="welcome-subtitle animate-fadeIn delay-50">
              Gestionează-ți programările și fișele medicale
            </p>
          </div>
          <Link to="/appointments/new">
            <button className="book-button animate-fadeIn">
              Programare nouă
            </button>
          </Link>
        </div>
        
        <div className="dashboard-cards animate-fadeIn">
          <div className="dashboard-card animate-slideUp">
            <div className="stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{appointments.length}</span>
              <span className="stat-label">Total programări</span>
              <span className="stat-sublabel">Programările tale</span>
            </div>
          </div>
        </div>
        
        <div className="appointments-section animate-fadeIn">
          <div className="section-header">
            <h2 className="section-title">Programările tale</h2>
          </div>
          
          {appointments.length > 0 ? (
            <div className="appointment-list">
              {appointments.map((appointment, index) => {
                const startDate = new Date(appointment.start.replace(" ", "T"));
                const endDate = new Date(appointment.end.replace(" ", "T"));
                const statusInfo = getStatusDisplay(appointment.status);
                const isCompleted = isAppointmentCompleted(appointment);
                const canCancel = canCancelAppointment(appointment);
                
                return (
                  <div
                    key={appointment.id}
                    className={`appointment-card animate-slideUp`}
                  >
                    <div className="appointment-layout">
                      {/* Visual date block */}
                      <div className="date-block">
                        <span className="date-block-weekday">
                          {startDate.toLocaleDateString('ro-RO', { weekday: 'short' })}
                        </span>
                        <span className="date-block-day">
                          {startDate.getDate()}
                        </span>
                        <span className="date-block-month">
                          {startDate.toLocaleDateString('ro-RO', { month: 'short' })}
                        </span>
                        <span className="date-block-time">
                          {startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </div>

                      <div className="appointment-details">
                        <div className="appointment-header">
                          <div>
                            <h3 className="doctor-name">
                              {appointment.doctor?.fullName || "Doctor necunoscut"}
                            </h3>
                            <p className="clinic-name">
                              Centru medical
                            </p>
                          </div>
                          <div className="appointment-status">
                            <span className={`status-badge ${statusInfo.className}`}>
                              {statusInfo.text}
                            </span>
                          </div>
                        </div>
                        <p className="appointment-reason">
                          {appointment.reason || "Niciun motiv specificat"}
                        </p>
                        <div className="appointment-time-info">
                          <div className="time-detail">
                            <p className="detail-label">Durată</p>
                            <p className="detail-value">
                              {startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(isCompleted || canCancel) && (
                      <div className="appointment-card-footer">
                        {isCompleted ? (
                          <button
                            className="action-button review-button"
                            onClick={() => handleLeaveReview(appointment)}
                          >
                            Lasă o recenzie
                          </button>
                        ) : canCancel ? (
                          <button
                            className="action-button cancel-button"
                            onClick={() => openCancelModal(appointment)}
                          >
                            Anulează programarea
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-appointments animate-fadeIn delay-200">
              <div className="empty-icon animate-fadeIn">
              </div>
              <h3 className="empty-title animate-fadeIn delay-50">
                Nicio programare
              </h3>
              <p className="empty-message animate-fadeIn delay-100">
                Nu ai nicio programare.
              </p>
              <Link to="/appointments/new">
                <button className="book-button animate-slideUp delay-150">
                  Fă prima ta programare
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

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={closeReviewModal}
        onSubmit={handleSubmitReview}
        appointmentDetails={selectedAppointment}
      />

      <ReviewSuccessModal
        isOpen={successModalOpen}
        onClose={closeSuccessModal}
        doctorName={submittedReview?.doctorName}
        rating={submittedReview?.rating}
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