import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/userService";

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
    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      init.headers = init.headers || {};
      if (user.jwtToken) {
        init.headers.Authorization = `Bearer ${user.jwtToken}`;
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
        setErrors(["Invalid credentials, please try again"]);
        return false;
      } else {
        setErrors([]);
        setUser(data.body);
        localStorage.setItem("user", JSON.stringify(data.body));
        return { success: true, role: data.body.userRole };
      }
    } catch {
      setErrors(["An error occurred during login"]);
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
        setErrors(["User with this email already exists, please try a different one"]);
      } else {
        setErrors([]);
        return true;
      }
    } catch {
      setErrors(["An error occurred during registration"]);
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