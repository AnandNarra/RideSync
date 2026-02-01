import { useEffect } from "react";
import useAuthStore from "../store/authStore";

const AuthInitializer = ({ children }) => {
  const {
    setCurrentUser,
    setUserProfile,
    setIsCheckingUser
  } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is logged in via localStorage
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
          setCurrentUser(null);
          setUserProfile(null);
          return;
        }

        // Parse and set user from localStorage
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setUserProfile(user);

      } catch (error) {
        console.error("Auth init error:", error);
        setCurrentUser(null);
        setUserProfile(null);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsCheckingUser(false);
      }
    };

    initAuth();
  }, []);

  return children;
};

export default AuthInitializer;
