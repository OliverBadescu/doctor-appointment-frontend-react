import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClinic } from '../services/api/clinicService';
import { getAllDoctors, getDoctorAvailability } from '../services/api/doctorService';
import { createAppointment } from '../services/api/appointmentService';
import { getReviewsByDoctorId } from '../services/api/reviewService';
import { UserContext } from '../services/state/userState';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Button,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  Typography,
  Rating,
  Box,
  Collapse,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function NewAppointment() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 3;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const todayObj = new Date();
  const [calendarMonth, setCalendarMonth] = useState(todayObj.getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(todayObj.getFullYear());

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const clinicsResponse = await getAllClinic();
        if (clinicsResponse.success) {
          setClinics(clinicsResponse.body.list);
        } else {
          setError("Încărcarea clinicilor a eșuat: " + clinicsResponse.message);
        }
        
        const doctorsResponse = await getAllDoctors();
        if (doctorsResponse.success) {
          setDoctors(doctorsResponse.body.list);
        } else {
          setError("Încărcarea doctorilor a eșuat: " + doctorsResponse.message);
        }
      } catch (err) {
        setError("A apărut o eroare la preluarea datelor");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      const filtered = doctors.filter(doctor => doctor.clinic.id == selectedClinic);
      setFilteredDoctors(filtered);
      
      const doctorInClinic = filtered.some(doc => doc.id == selectedDoctor);
      if (!doctorInClinic) {
        setSelectedDoctor("");
        setSelectedDoctorName("");
        setDate("");
        setTime("");
        setAvailableTimeSlots([]);
        setDoctorReviews([]);
        setReviewsExpanded(false);
        setCurrentReviewPage(1);
      }
    } else {
      setFilteredDoctors([]);
      setSelectedDoctor("");
      setSelectedDoctorName("");
      setDate("");
      setTime("");
      setAvailableTimeSlots([]);
      setDoctorReviews([]);
      setReviewsExpanded(false);
      setCurrentReviewPage(1);
    }
  }, [selectedClinic, doctors, selectedDoctor]);

  useEffect(() => {
    async function fetchDoctorAvailability() {
      if (selectedDoctor && date) {
        setAvailabilityLoading(true);
        setAvailableTimeSlots([]);
        setTime("");
        
        try {
          const response = await getDoctorAvailability(date, selectedDoctor);
          
          if (response.success && response.body.timesList) {
            const availableSlots = generateAvailableSlots(response.body.timesList);
            setAvailableTimeSlots(availableSlots);
            
            if (availableSlots.length === 0) {
              setError("Nu există ore disponibile pentru programare la această dată");
            } else {
              setError("");
            }
          } else {
            setError("Încărcarea disponibilității doctorului a eșuat: " + (response.message || "Eroare necunoscută"));
            setAvailableTimeSlots([]);
          }
        } catch (err) {
          setError("A apărut o eroare la preluarea disponibilității doctorului");
          console.error(err);
          setAvailableTimeSlots([]);
        } finally {
          setAvailabilityLoading(false);
        }
      }
    }
    
    fetchDoctorAvailability();
  }, [selectedDoctor, date]);


  useEffect(() => {
    async function fetchDoctorReviews() {
      if (selectedDoctor) {
        setReviewsLoading(true);
        setDoctorReviews([]);
        
        try {
          const response = await getReviewsByDoctorId(selectedDoctor);
          
          if (response.success && response.body) {
         
            const reviews = Array.isArray(response.body) ? response.body : 
                           response.body.list ? response.body.list : [];
            setDoctorReviews(reviews);
            setCurrentReviewPage(1); 
          } else {

            setDoctorReviews([]);
          }
        } catch (err) {
          console.error("Error fetching doctor reviews:", err);
          setDoctorReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      }
    }
    
    fetchDoctorReviews();
  }, [selectedDoctor]);

  const generateAvailableSlots = (timesList) => {
    return timesList.map(range => {
      const [start, end] = range.split(" - ");
      return `${convertTo12Hour(start)} - ${convertTo12Hour(end)}`;
    });
  };

  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    let period = 'AM';
    let displayHours = hours;
    
    if (hours >= 12) {
      period = 'PM';
      displayHours = hours === 12 ? 12 : hours - 12;
    }
    displayHours = displayHours === 0 ? 12 : displayHours;
    
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const convertTo24Hour = (time) => {
    if (time.includes('AM') || time.includes('PM')) {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (period === 'PM' && hours < 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    return time;
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctor(doctorId);
    setDate("");
    setTime("");
    setAvailableTimeSlots([]);
    setReviewsExpanded(false);
    setCurrentReviewPage(1);
    
    if (doctorId) {
      const doctor = doctors.find(doc => doc.id == doctorId);
      if (doctor) {
        setSelectedDoctorName(doctor.fullName);
      }
    } else {
      setSelectedDoctorName("");
      setDoctorReviews([]);
      setCurrentReviewPage(1);
    }
  };

  const formatTimeForBackend = (timeString) => {
    const startTime12 = timeString.split(' - ')[0];
    return convertTo24Hour(startTime12);
  };

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes
      .toString()
      .padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotalPages = (totalReviews) => {
    return Math.ceil(totalReviews / reviewsPerPage);
  };

  const getCurrentPageReviews = () => {
    const startIndex = (currentReviewPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return doctorReviews.slice(startIndex, endIndex);
  };

  const handleReviewPageChange = (newPage) => {
    setCurrentReviewPage(newPage);
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const formatReviewDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClinic || !selectedDoctor || !date || !time || !reason) {
      setError("Te rugăm să completezi toate câmpurile obligatorii");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const formattedTime = formatTimeForBackend(time);
      const startDateTime = `${date} ${formattedTime}`;
      const endTime = calculateEndTime(formattedTime);
      const endDateTime = `${date} ${endTime}`;
      
      const appointmentData = {
        start: startDateTime,
        end: endDateTime,
        doctorName: selectedDoctorName,
        patientId: user.id,
        reason: reason
      };
      
      const response = await createAppointment(appointmentData);
      
      if (response.success) {
        setAppointmentDetails({
          doctor: selectedDoctorName,
          date: formatDate(date),
          time: time,
          clinic: clinics.find(c => c.id == selectedClinic)?.name || "Clinică selectată"
        });
        
        setSuccessDialogOpen(true);
      } else {
        setError("Realizarea programării a eșuat: " + response.message);
      }
    } catch (err) {
      setError("A apărut o eroare la realizarea programării");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    navigate("/appointment");
  };
  
  const today = new Date().toISOString().split("T")[0];


  if (isLoading && (!clinics.length || !doctors.length)) {
    return <div className="loading-container animate-fadeIn">Se încarcă datele programării...</div>;
  }

  return (
    <div className="appointment-container animate-fadeIn">
      <div className="appointment-header animate-slideUp">
        <h1 className="appointment-title">Fă o programare</h1>
        <p className="appointment-subtitle">Programează-ți vizita la un profesionist în sănătate</p>
      </div>
      
      {error && (
        <div className="error-message animate-fadeIn">
          {error}
        </div>
      )}
      
      <div className="appointment-card animate-slideUp">
        <div className="card-header animate-fadeIn">
          <h2 className="card-title">Detalii programare</h2>
          <p className="card-description">
            Completează informațiile de mai jos pentru a-ți programa consultația
          </p>
        </div>
        <div className="card-content animate-fadeIn delay-100">
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-fields animate-fadeIn delay-200">
              <div className="form-group animate-slideUp delay-100">
                <label htmlFor="clinic" className="form-label">Selectează clinica</label>
                <select 
                  id="clinic" 
                  className="form-select"
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                >
                  <option value="">Selectează o clinică</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group animate-slideUp delay-200">
                <label htmlFor="doctor" className="form-label">Selectează doctorul</label>
                <select 
                  id="doctor" 
                  className="form-select"
                  value={selectedDoctor}
                  onChange={handleDoctorChange}
                  disabled={!selectedClinic}
                >
                  <option value="">
                    {selectedClinic ? "Selectează un doctor" : "Selectează mai întâi o clinică"}
                  </option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Reviews Section */}
              {selectedDoctor && (
                <div className="reviews-section animate-fadeIn">
                  <div 
                    className="reviews-header"
                    onClick={() => setReviewsExpanded(!reviewsExpanded)}
                  >
                    <div className="reviews-summary">
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        Recenzii doctori
                      </Typography>
                      {reviewsLoading ? (
                        <CircularProgress size={20} />
                      ) : doctorReviews.length > 0 ? (
                        <div className="rating-display">
                          <Rating 
                            value={parseFloat(calculateAverageRating(doctorReviews))} 
                            readOnly 
                            precision={0.1}
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {calculateAverageRating(doctorReviews)} ({doctorReviews.length} recenzi{doctorReviews.length !== 1 ? 'i' : 'e'})
                          </Typography>
                        </div>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nicio recenzie încă
                        </Typography>
                      )}
                    </div>
                    <IconButton size="small">
                      {reviewsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </div>
                  
                  <Collapse in={reviewsExpanded}>
                    <Box sx={{ mt: 2 }}>
                      {reviewsLoading ? (
                        <div className="reviews-loading">
                          <CircularProgress size={24} />
                          <Typography sx={{ mt: 1 }}>Se încarcă recenziile...</Typography>
                        </div>
                      ) : doctorReviews.length > 0 ? (
                        <div>
                          {getCurrentPageReviews().map((review, index) => (
                            <div key={review.id || index} className="review-card">
                              <div className="review-header">
                                <div className="reviewer-info">
                                  <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                  <Typography variant="subtitle2">
                                    Pacient #{review.userId || 'Anonim'}
                                  </Typography>
                                  <Rating value={review.rating || 0} readOnly size="small" />
                                </div>
                                <Typography variant="caption" className="review-date">
                                  {review.createdAt ? formatReviewDate(review.createdAt) : 'Recent'}
                                </Typography>
                              </div>
                              {review.title && (
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                  {review.title}
                                </Typography>
                              )}
                              {review.description && (
                                <Typography variant="body2" className="review-text">
                                  "{review.description}"
                                </Typography>
                              )}
                            </div>
                          ))}
                          
                          {/* Pagination Controls */}
                          {doctorReviews.length > reviewsPerPage && (
                            <div className="pagination-container">
                              <div className="pagination-info">
                                <Typography variant="body2" color="text.secondary">
                                  Se afișează {Math.min((currentReviewPage - 1) * reviewsPerPage + 1, doctorReviews.length)} - {Math.min(currentReviewPage * reviewsPerPage, doctorReviews.length)} din {doctorReviews.length} recenzii
                                </Typography>
                              </div>
                              <div className="pagination-controls">
                                <Button
                                  size="small"
                                  disabled={currentReviewPage === 1}
                                  onClick={() => handleReviewPageChange(currentReviewPage - 1)}
                                  sx={{ minWidth: 'auto', px: 1 }}
                                >
                                  Anterior
                                </Button>
                                
                                <div className="page-numbers">
                                  {Array.from({ length: calculateTotalPages(doctorReviews.length) }, (_, i) => i + 1).map((page) => (
                                    <Button
                                      key={page}
                                      size="small"
                                      variant={page === currentReviewPage ? "contained" : "outlined"}
                                      onClick={() => handleReviewPageChange(page)}
                                      sx={{ 
                                        minWidth: '32px', 
                                        width: '32px', 
                                        height: '32px', 
                                        mx: 0.25,
                                        fontSize: '0.875rem'
                                      }}
                                    >
                                      {page}
                                    </Button>
                                  ))}
                                </div>
                                
                                <Button
                                  size="small"
                                  disabled={currentReviewPage === calculateTotalPages(doctorReviews.length)}
                                  onClick={() => handleReviewPageChange(currentReviewPage + 1)}
                                  sx={{ minWidth: 'auto', px: 1 }}
                                >
                                  Următor
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="no-reviews">
                          <Typography variant="body2">
                            Acest doctor nu a primit încă nicio recenzie. Fii primul care își împărtășește experiența!
                          </Typography>
                        </div>
                      )}
                    </Box>
                  </Collapse>
                </div>
              )}
              
              {/* Inline Calendar */}
              <div className="form-group animate-slideUp delay-300">
                <label className="form-label">Selectează data</label>
                {!selectedDoctor ? (
                  <div className="calendar-disabled-message">
                    Selectează mai întâi un doctor
                  </div>
                ) : (
                  <div className="inline-calendar">
                    <div className="calendar-nav">
                      <button
                        type="button"
                        className="calendar-nav-btn"
                        onClick={() => {
                          const d = new Date(calendarYear, calendarMonth - 1, 1);
                          setCalendarMonth(d.getMonth() + 1);
                          setCalendarYear(d.getFullYear());
                        }}
                        disabled={calendarYear === todayObj.getFullYear() && calendarMonth === todayObj.getMonth() + 1}
                      >
                        <ChevronLeftIcon fontSize="small" />
                      </button>
                      <span className="calendar-month-label">
                        {new Date(calendarYear, calendarMonth, 0).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        type="button"
                        className="calendar-nav-btn"
                        onClick={() => {
                          const d = new Date(calendarYear, calendarMonth + 1, 1);
                          setCalendarMonth(d.getMonth() + 1);
                          setCalendarYear(d.getFullYear());
                        }}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </button>
                    </div>
                    <div className="calendar-grid">
                      {['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'].map(day => (
                        <div key={day} className="calendar-weekday">{day}</div>
                      ))}
                      {(() => {
                        const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                        const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                        const cells = [];
                        for (let i = 0; i < firstDayOfWeek; i++) {
                          cells.push(<div key={`empty-${i}`} className="calendar-day empty" />);
                        }
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const dayOfWeek = new Date(calendarYear, calendarMonth - 1, day).getDay();
                          const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                          const isPast = dateStr < today;
                          const isSelected = dateStr === date;
                          const isToday = dateStr === today;
                          const disabled = isWeekendDay || isPast;

                          cells.push(
                            <button
                              key={day}
                              type="button"
                              disabled={disabled}
                              className={`calendar-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}${disabled ? ' disabled' : ''}`}
                              onClick={() => {
                                setDate(dateStr);
                                setTime("");
                                setAvailableTimeSlots([]);
                              }}
                            >
                              {day}
                            </button>
                          );
                        }
                        return cells;
                      })()}
                    </div>
                    <p className="calendar-hint">Weekendurile nu sunt disponibile</p>
                  </div>
                )}
              </div>

              {/* Time Slot Grid */}
              <div className="form-group animate-slideUp delay-400">
                <label className="form-label">
                  <AccessTimeIcon sx={{ fontSize: 18, verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Selectează ora
                </label>
                {!date ? (
                  <div className="calendar-disabled-message">
                    Selectează mai întâi o dată
                  </div>
                ) : availabilityLoading ? (
                  <div className="timeslot-loading">
                    <CircularProgress size={24} />
                    <span>Se încarcă orele disponibile...</span>
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="timeslot-empty">
                    Nu există ore disponibile pentru această dată
                  </div>
                ) : (
                  <div className="timeslot-grid">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`timeslot-pill${time === slot ? ' selected' : ''}`}
                        onClick={() => setTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-group animate-slideUp delay-500">
                <label htmlFor="reason" className="form-label">Motivul vizitei</label>
                <textarea
                  id="reason"
                  className="form-textarea"
                  placeholder="Descrie pe scurt simptomele sau motivul programării"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-actions animate-fadeIn delay-600">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/appointment")}
              >
                Anulează
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading || !selectedClinic || !selectedDoctor || !date || !time}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" style={{ marginRight: '8px' }} />
                    Se realizează programarea...
                  </>
                ) : "Fă o programare"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessClose}
        aria-labelledby="appointment-success-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="appointment-success-dialog" sx={{ textAlign: 'center', pb: 0 }}>
          Programare realizată cu succes!
        </DialogTitle>
        
        <DialogContent className="success-dialog-content">
          <Fade in={successDialogOpen}>
            <CheckCircleIcon className="success-icon" />
          </Fade>
          
          <DialogContentText>
            Programarea ta a fost realizată cu succes. Poți vedea toate programările în secțiunea de programări.
          </DialogContentText>
          
          {appointmentDetails && (
            <div className="appointment-details">
              <div className="detail-row">
                <span className="detail-label">Doctor:</span>
                <span>{appointmentDetails.doctor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Clinică:</span>
                <span>{appointmentDetails.clinic}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dată:</span>
                <span>{appointmentDetails.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Oră:</span>
                <span>{appointmentDetails.time}</span>
              </div>
            </div>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleSuccessClose} 
            variant="contained" 
            color="primary"
            sx={{ minWidth: '150px' }}
          >
            Mergi la programările mele
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}