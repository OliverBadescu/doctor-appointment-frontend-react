import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClinic } from '../services/api/clinicService';
import { getAllDoctors, getDoctorAvailability } from '../services/api/doctorService';
import { createAppointment } from '../services/api/appointmentService';
import { UserContext } from '../services/state/userContext';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Button,
  CircularProgress,
  Fade
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  const [error, setError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Success modal state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const clinicsResponse = await getAllClinic();
        if (clinicsResponse.success) {
          setClinics(clinicsResponse.body.list);
        } else {
          setError("Failed to load clinics: " + clinicsResponse.message);
        }
        
        const doctorsResponse = await getAllDoctors();
        if (doctorsResponse.success) {
          setDoctors(doctorsResponse.body.list);
        } else {
          setError("Failed to load doctors: " + doctorsResponse.message);
        }
      } catch (err) {
        setError("An error occurred while fetching data");
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
      }
    } else {
      setFilteredDoctors([]);
      setSelectedDoctor("");
      setSelectedDoctorName("");
      setDate("");
      setTime("");
      setAvailableTimeSlots([]);
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
              setError("No available appointment slots for this date");
            } else {
              setError("");
            }
          } else {
            setError("Failed to load doctor's availability: " + (response.message || "Unknown error"));
            setAvailableTimeSlots([]);
          }
        } catch (err) {
          setError("An error occurred while fetching doctor's availability");
          console.error(err);
          setAvailableTimeSlots([]);
        } finally {
          setAvailabilityLoading(false);
        }
      }
    }
    
    fetchDoctorAvailability();
  }, [selectedDoctor, date]);

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
    
    if (doctorId) {
      const doctor = doctors.find(doc => doc.id == doctorId);
      if (doctor) {
        setSelectedDoctorName(doctor.fullName);
      }
    } else {
      setSelectedDoctorName("");
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (isWeekend(selectedDate)) {
      return; 
    }
    
    setDate(selectedDate);
    setTime("");
    setAvailableTimeSlots([]);
  };

  const isWeekend = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDay();
    return day === 0 || day === 6; 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClinic || !selectedDoctor || !date || !time || !reason) {
      setError("Please fill all required fields");
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
        // Store appointment details for display in success modal
        setAppointmentDetails({
          doctor: selectedDoctorName,
          date: formatDate(date),
          time: time,
          clinic: clinics.find(c => c.id == selectedClinic)?.name || "Selected Clinic"
        });
        
        // Show success modal instead of alert
        setSuccessDialogOpen(true);
      } else {
        setError("Failed to book appointment: " + response.message);
      }
    } catch (err) {
      setError("An error occurred while booking your appointment");
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

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .weekend-disabled input[type="date"]::-webkit-calendar-picker-indicator {
        position: relative;
      }
      .form-input[type="date"]:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }
      .time-loading {
        opacity: 0.6;
      }
      .success-icon {
        font-size: 64px;
        color: #4caf50;
        margin-bottom: 16px;
      }
      .success-dialog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        text-align: center;
      }
      .appointment-details {
        margin: 16px 0;
        padding: 16px;
        background-color: #f5f9ff;
        border-radius: 8px;
        width: 100%;
        text-align: left;
      }
      .detail-row {
        display: flex;
        margin-bottom: 8px;
      }
      .detail-label {
        font-weight: 500;
        width: 100px;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (isLoading && (!clinics.length || !doctors.length)) {
    return <div className="loading-container animate-fadeIn">Loading appointment data...</div>;
  }

  return (
    <div className="appointment-container animate-fadeIn">
      <div className="appointment-header animate-slideUp">
        <h1 className="appointment-title">Book an Appointment</h1>
        <p className="appointment-subtitle">Schedule your visit with a healthcare professional</p>
      </div>
      
      {error && (
        <div className="error-message animate-fadeIn">
          {error}
        </div>
      )}
      
      <div className="appointment-card animate-slideUp">
        <div className="card-header animate-fadeIn">
          <h2 className="card-title">Appointment Details</h2>
          <p className="card-description">
            Fill in the information below to schedule your appointment
          </p>
        </div>
        <div className="card-content animate-fadeIn delay-100">
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-fields animate-fadeIn delay-200">
              <div className="form-group animate-slideUp delay-100">
                <label htmlFor="clinic" className="form-label">Select Clinic</label>
                <select 
                  id="clinic" 
                  className="form-select"
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                >
                  <option value="">Select a clinic</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group animate-slideUp delay-200">
                <label htmlFor="doctor" className="form-label">Select Doctor</label>
                <select 
                  id="doctor" 
                  className="form-select"
                  value={selectedDoctor}
                  onChange={handleDoctorChange}
                  disabled={!selectedClinic}
                >
                  <option value="">
                    {selectedClinic ? "Select a doctor" : "First select a clinic"}
                  </option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="date-time-container">
                <div className="form-group weekend-disabled animate-slideUp delay-300">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    id="date"
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={handleDateChange}
                    min={today}
                    required
                    disabled={!selectedDoctor}
                  />
                  {selectedDoctor && (
                    <small className="form-text text-muted animate-fadeIn">
                      Weekends are not available for appointments
                    </small>
                  )}
                </div>
                <div className="form-group animate-slideUp delay-400">
                  <label htmlFor="time" className="form-label">Time</label>
                  <select 
                    id="time" 
                    className={`form-select ${availabilityLoading ? 'time-loading' : ''}`}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={!date || availabilityLoading || availableTimeSlots.length === 0}
                  >
                    <option value="">
                      {!date ? "First select a date" : 
                       availabilityLoading ? "Loading available times..." :
                       availableTimeSlots.length === 0 ? "No available slots" : "Select a time"}
                    </option>
                    {availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {date && availableTimeSlots.length === 0 && !availabilityLoading && (
                    <small className="form-text text-muted animate-fadeIn">
                      No available appointment slots for this date
                    </small>
                  )}
                </div>
              </div>
              
              <div className="form-group animate-slideUp delay-500">
                <label htmlFor="reason" className="form-label">Reason for Visit</label>
                <textarea
                  id="reason"
                  className="form-textarea"
                  placeholder="Please briefly describe your symptoms or reason for the appointment"
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
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading || !selectedClinic || !selectedDoctor || !date || !time}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" style={{ marginRight: '8px' }} />
                    Booking Appointment...
                  </>
                ) : "Book Appointment"}
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
          Appointment Booked Successfully!
        </DialogTitle>
        
        <DialogContent className="success-dialog-content">
          <Fade in={successDialogOpen}>
            <CheckCircleIcon className="success-icon" />
          </Fade>
          
          <DialogContentText>
            Your appointment has been successfully scheduled. You can view all your appointments in the appointments section.
          </DialogContentText>
          
          {appointmentDetails && (
            <div className="appointment-details">
              <div className="detail-row">
                <span className="detail-label">Doctor:</span>
                <span>{appointmentDetails.doctor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Clinic:</span>
                <span>{appointmentDetails.clinic}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span>{appointmentDetails.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
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
            Go to My Appointments
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}