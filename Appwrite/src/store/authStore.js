// import { setAccessToken } from "@/utils/tokens";
// import { create } from "zustand";

// const useAuthStore = create((set) => ({
//   currentUser: null,
//   userProfile: null,
//   isCheckingUser: true,

//   setCurrentUser: (user) => set({ currentUser: user }),
//   setUserProfile: (profile) => set({ userProfile: profile }),
//   setIsCheckingUser: (value) => set({ isCheckingUser: value }),

//   // Logout function to clear auth state
//   logout: () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     set({ currentUser: null, userProfile: null });
//   },


//   user:null,
//   setUser: (userData) => (set({user:userData})),

//   accessToken : null,
//   setAccessToken : (AccessToken) =>(set(({accessToken:AccessToken})))

// }));

// export default useAuthStore;



import { create } from "zustand";

const useAuthStore = create((set) => ({
  // ===== Auth State =====
  user: null,
  accessToken: null,
  isCheckingUser: true,

  // ===== Actions =====
  setUser: (userData) => set({ user:userData }),
  setAccessToken: (token) => set({ accessToken: token }),
  setIsCheckingUser: (value) => set({ isCheckingUser: value }),

  // ===== Logout =====
  logout: () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("user");

    set({
      user: null,
      accessToken: null,
      isCheckingUser: false,
    });
  },
}));

export default useAuthStore;
