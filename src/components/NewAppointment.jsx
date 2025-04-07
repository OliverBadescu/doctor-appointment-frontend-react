import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';


export default function NewAppointment() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    
    
    
    
    const mockClinics = [
      {
        id: "clinic1",
        name: "City Medical Center",
        address: "123 Main St, Cityville"
      },
      {
        id: "clinic2",
        name: "Riverdale Clinic",
        address: "456 Oak Ave, Riverdale"
      },
      {
        id: "clinic3",
        name: "Westside Health Center",
        address: "789 Pine Rd, Westside"
      }
    ];
    
    
    const mockDoctors = [
      {
        id: "doctor1",
        name: "Dr. Sarah Johnson",
        specialty: "General Practitioner",
        clinicId: "clinic1"
      },
      {
        id: "doctor2",
        name: "Dr. Robert Williams",
        specialty: "Cardiologist",
        clinicId: "clinic1"
      },
      {
        id: "doctor3",
        name: "Dr. Michael Chen",
        specialty: "Pediatrician",
        clinicId: "clinic2"
      },
      {
        id: "doctor4",
        name: "Dr. Jessica Lee",
        specialty: "Dermatologist",
        clinicId: "clinic2"
      },
      {
        id: "doctor5",
        name: "Dr. David Miller",
        specialty: "Neurologist",
        clinicId: "clinic3"
      }
    ];
    
    setClinics(mockClinics);
    setDoctors(mockDoctors);
  }, [navigate]);
  
  
  useEffect(() => {
    if (selectedClinic) {
      const filtered = doctors.filter(doctor => doctor.clinicId === selectedClinic);
      setFilteredDoctors(filtered);
      
      const doctorInClinic = filtered.some(doc => doc.id === selectedDoctor);
      if (!doctorInClinic) {
        setSelectedDoctor("");
      }
    } else {
      setFilteredDoctors([]);
      setSelectedDoctor("");
    }
  }, [selectedClinic, doctors, selectedDoctor]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedClinic || !selectedDoctor || !date || !time) {
      alert("Please fill all required fields");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      alert("Appointment booked successfully! Your appointment has been scheduled.");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1500);
  };
  
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="appointment-container">
      <div className="appointment-header">
        <h1 className="appointment-title">Book an Appointment</h1>
        <p className="appointment-subtitle">Schedule your visit with a healthcare professional</p>
      </div>
      
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
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  disabled={!selectedClinic}
                >
                  <option value="">
                    {selectedClinic ? "Select a doctor" : "First select a clinic"}
                  </option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialty})
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
                onClick={() => navigate("/dashboard")}
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