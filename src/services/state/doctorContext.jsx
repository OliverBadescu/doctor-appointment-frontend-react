import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/doctorService";
import { isJwtExpired } from "../api/api-utils.jsx";

export const DoctorContext = createContext();

export function DoctorProvider({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [doctor, setDoctor] = useState(() => {
    const savedDoctor = localStorage.getItem("doctor");
    if (savedDoctor) {
      return JSON.parse(savedDoctor);
    }
    return {
      jwtToken: '',
      fullName: '',
      password: '',
      email: '',
      specialization: '',
      phone: '',
      clinic: ''
    };
  });

  const checkDoctor = () => {
    if (doctor.id === 0) {
      navigate('/login-doctor');
    }
  };

  useEffect(() => {
    checkDoctor();
  }, []);

  useEffect(() => {
    if (doctor.jwtToken && isJwtExpired(doctor.jwtToken)) {
      handleLogout();
      return;
    }

    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      init.headers = init.headers || {};
      if (doctor.jwtToken) {
        if (isJwtExpired(doctor.jwtToken)) {
          handleLogout();
          return new Response(null, { status: 401, statusText: 'Token expired' });
        }
        init.headers.Authorization = `Bearer ${doctor.jwtToken}`;
      }

      try {
        const response = await originalFetch(input, init);
        if (response.status === 401 || response.status === 403) {
          handleLogout();
        }
        return response;
      } catch (err) {
        throw err;
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [doctor.jwtToken]);

  function handleLogout() {
    localStorage.removeItem("doctor");
    setDoctor({
        jwtToken: '',
        fullName: '',
        password: '',
        email: '',
        specialization: '',
        phone: '',
        clinic: ''
    });
    navigate("/login-doctor");
  }

  async function handleDoctorLogin(loginRequest) {
    setLoading(true);
    setErrors([]);
    try {
      const data = await login(loginRequest);
      if (!data.success) {
        setErrors(["Date de autentificare invalide, te rugăm să încerci din nou"]);
        return { success: false };
      } else {
        setErrors([]);
        setDoctor(data.body);
        localStorage.setItem("doctor", JSON.stringify(data.body));
        return { success: true };
      }
    } catch {
      setErrors(["A apărut o eroare la autentificare"]);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        loading,
        errors,
        setErrors,
        handleDoctorLogin,
        handleLogout
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}