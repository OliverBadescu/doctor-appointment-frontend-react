import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorLogin } from "../api/doctorService";

export const DoctorContext = createContext();

export function DoctorProvider({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [doctor, setDoctor] = useState({
    jwtToken: '', 
        fullName: '',
        password: '',
        email: '',
        specialization: '',
        phone: '',
        clinic: ''
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
    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      init.headers = init.headers || {};
      if (doctor.jwtToken) {
        init.headers.Authorization = `Bearer ${doctor.jwtToken}`;
      }

      try {
        const response = await originalFetch(input, init);
        if (response.status === 401) {
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
      const data = await doctorLogin(loginRequest);
      if (!data.success) {
        setErrors(["Invalid credentials, please try again"]);
        return { success: false };
      } else {
        setErrors([]);
        setDoctor(data.body);
        return { success: true };
      }
    } catch {
      setErrors(["An error occurred during login"]);
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