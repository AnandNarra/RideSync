import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import AppwriteAccount from "../appwrite/AccountServices";
import { getUserByAuthId } from "@/utils/userDetailesTableOps";

const AuthInitializer = ({ children }) => {
  const {
    setCurrentUser,
    setUserProfile,
    setIsCheckingUser
  } = useAuthStore();

  const appwriteAccount = new AppwriteAccount();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authUser = await appwriteAccount.getAppwriteUser();

        
        if (!authUser) {
          setCurrentUser(null);
          setUserProfile(null);
          return;
        }

       
        setCurrentUser(authUser);

      
        const profile = await getUserByAuthId(authUser.$id);
        setUserProfile(profile);

      } catch (error) {
        console.error("Auth init error:", error);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setIsCheckingUser(false);
      }
    };

    initAuth();
  }, []);

  return children;
};

export default AuthInitializer;
