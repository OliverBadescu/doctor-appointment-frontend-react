import './App.css'
import Appointments from './Home/AppointmentsPage/AppointmentsPage';
import Home from './Home/Home'
import NewPatient from './Home/NewPatient/NewPatient'
import ClinicPage from './Home/ClincPage/ClinicPage';
import DoctorPage from './Home/DoctorPage/DoctorPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  

  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/new-patient" element={<NewPatient />} />
        <Route path="/appointment-page/:patientId" element={<Appointments />} />
        <Route path="/clinic-page" element={<ClinicPage />} />
        <Route path="/doctor-page" element={<DoctorPage />} />
      </Routes>
    </Router>
  );
}

export default App
