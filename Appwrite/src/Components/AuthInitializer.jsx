import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import { getAccessToken } from "@/utils/tokens";

const AuthInitializer = ({ children }) => {
  const {
    setUser,
    setAccessToken,
    setIsCheckingUser
  } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is logged in via localStorage
        const token = getAccessToken();
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
          setUser(null);
          setAccessToken(null);
          return;
        }

        // Parse and set user from localStorage
        const user = JSON.parse(userStr);
        setUser(user);
        setAccessToken(token);

      } catch (error) {
        console.error("Auth init error:", error);
        setUser(null);
        setAccessToken(null);
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
