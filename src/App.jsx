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
import { UserProvider } from './services/state/userContext.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminHomePage from './components/admin/AdminHomePage.jsx';
import ClinicsPageAdmin from './components/admin/ClinicsPageAdmin.jsx';
import DoctorsPageAdmin from './components/admin/DoctorsPageAdmin.jsx';
import PatientsPageAdmin from './components/admin/PatientsPageAdmin.jsx';

function App() {
  return (
    <Router>
      <UserProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/appointment" element={<Dashboard />} />
          <Route path="/appointments/new" element={<NewAppointment />} />

          <Route path="/admin/*" element={<AdminLayout />}>  
            <Route path="home" element={<AdminHomePage />} />
            <Route path="clinics" element={<ClinicsPageAdmin />} />
            <Route path="doctors" element={<DoctorsPageAdmin />} />
            <Route path="patients" element={<PatientsPageAdmin />} />
            <Route index element={<Navigate to="home" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </UserProvider>
    </Router>
  );
}

export default App;
