import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/userService";
import { isJwtExpired } from "../api/api-utils.jsx";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return {
      email: "",
      fullName: "",
      id: 0,
      jwtToken: "",
      userRole: ""
    };
  });

  useEffect(() => {
    if (user.jwtToken && isJwtExpired(user.jwtToken)) {
      handleLogout();
      setIsAuthReady(true);
      return;
    }

    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      init.headers = init.headers || {};
      if (user.jwtToken) {
        if (isJwtExpired(user.jwtToken)) {
          handleLogout();
          return new Response(null, { status: 401, statusText: 'Token expired' });
        }
        init.headers.Authorization = `Bearer ${user.jwtToken}`;
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
    setIsAuthReady(true);
    return () => {
      window.fetch = originalFetch;
    };
  }, [user.jwtToken]);

  function handleLogout() {
    localStorage.removeItem("user");
    setUser({
      email: "",
      fullName: "",
      id: 0,
      jwtToken: "",
      phone: "",
      userRole: ""
    });
    navigate("/");
  }

  async function handleLogin(loginRequest) {
    setLoading(true);
    setErrors([]);
    try {
      const data = await login(loginRequest);
      if (!data.success) {
        setErrors(["Date de autentificare invalide, te rugăm să încerci din nou"]);
        return false;
      } else {
        setErrors([]);
        setUser(data.body);
        localStorage.setItem("user", JSON.stringify(data.body));
        return { success: true, role: data.body.userRole };
      }
    } catch {
      setErrors(["A apărut o eroare la autentificare"]);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function updateUserDetails(updates) {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }

  async function handleRegister(registerRequest) {
    setLoading(true);
    setErrors([]);
    try {
      const data = await register(registerRequest);

      console.log(data);
      if (data.status === 409) {
        setErrors(["Există deja un utilizator cu acest email, te rugăm să folosești altul"]);
      } else {
        setErrors([]);
        return true;
      }
    } catch {
      setErrors(["A apărut o eroare la înregistrare"]);
    } finally {
      setLoading(false);
    }
    return false;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        errors,
        isAuthReady,
        setErrors,
        handleLogin,
        handleLogout,
        handleRegister,
        updateUserDetails
      }}
    >
      {children}
    </UserContext.Provider>
  );
}