import './App.css';
import './animations.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Dashboard from './components/Dashboard.jsx';
import NewAppointment from './components/NewAppointment.jsx';
import { UserProvider } from './services/state/userState.jsx';
import DoctorLogin from './components/doctor/DoctorLogin.jsx';
import DoctorDashboard from "./components/doctor/DoctorDashboard.jsx";
import { DoctorProvider } from './services/state/doctorContext.jsx';

function App() {
  return (
    <Router>
      <UserProvider>
        <DoctorProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/appointment" element={<Dashboard />} />
            <Route path="/appointments/new" element={<NewAppointment />} />
            <Route path="/login-doctor" element={<DoctorLogin />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </DoctorProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
