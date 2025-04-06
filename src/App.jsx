import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from './components/Footer.jsx';

function App() {
  

  return (
    
    <Router>
        <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
        <Footer/>
    </Router>
  );
}

export default App
