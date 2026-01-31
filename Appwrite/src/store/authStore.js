import { create } from "zustand";

const useAuthStore = create((set) => ({
  currentUser: null,     
  userProfile: null,     
  isCheckingUser: true,

  setCurrentUser: (user) => set({ currentUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setIsCheckingUser: (value) => set({ isCheckingUser: value }),
}));

export default useAuthStore;
