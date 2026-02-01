import { create } from "zustand";

const useAuthStore = create((set) => ({
  currentUser: null,
  userProfile: null,
  isCheckingUser: true,

  setCurrentUser: (user) => set({ currentUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setIsCheckingUser: (value) => set({ isCheckingUser: value }),

  // Logout function to clear auth state
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ currentUser: null, userProfile: null });
  },
}));

export default useAuthStore;
