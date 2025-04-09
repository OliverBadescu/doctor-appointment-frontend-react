import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClinic } from '../services/api/clinicService';
import { getAllDoctors } from '../services/api/doctorService';
import { createAppointment } from '../services/api/appointmentService';
import { UserContext } from '../services/state/userContext';

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
  const [error, setError] = useState("");
  
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
      }
    } else {
      setFilteredDoctors([]);
      setSelectedDoctor("");
      setSelectedDoctorName("");
    }
  }, [selectedClinic, doctors, selectedDoctor]);
  
  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctor(doctorId);
    

    if (doctorId) {
      const doctor = doctors.find(doc => doc.id == doctorId);


      if (doctor) {

        setSelectedDoctorName(doctor.fullName);

      }
    } else {
      setSelectedDoctorName("");
    }
  };
  
  const calculateEndTime = (startTime) => {

    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  
  const formatTimeForBackend = (timeString) => {

    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClinic || !selectedDoctor || !date || !time) {
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
        patientId: user.id
      };
      
      const response = await createAppointment(appointmentData);
      
      if (response.success) {
        alert("Appointment booked successfully!");
        navigate("/appointment");
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
  
  const today = new Date().toISOString().split("T")[0];

  if (isLoading && (!clinics.length || !doctors.length)) {
    return <div className="loading-container">Loading appointment data...</div>;
  }

  return (
    <div className="appointment-container">
      <div className="appointment-header">
        <h1 className="appointment-title">Book an Appointment</h1>
        <p className="appointment-subtitle">Schedule your visit with a healthcare professional</p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="appointment-card">
        <div className="card-header">
          <h2 className="card-title">Appointment Details</h2>
          <p className="card-description">
            Fill in the information below to schedule your appointment
          </p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-fields">
              <div className="form-group">
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
              
              <div className="form-group">
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
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    id="date"
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time" className="form-label">Time</label>
                  <select 
                    id="time" 
                    className="form-select"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
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
            
            <div className="form-actions">
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
                disabled={isLoading}
              >
                {isLoading ? "Booking Appointment..." : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}