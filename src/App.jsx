import './App.css'
import Home from './Home/Home'
import NewPatient from './Home/NewPatient/NewPatient'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/new-patient" element={<NewPatient />} />
      </Routes>
    </Router>
  );
}

export default App
