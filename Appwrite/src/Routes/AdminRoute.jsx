// import { Navigate, Outlet } from "react-router";
// import useAuthStore from "../store/authStore";

// const AdminRoute = () => {
//   const { currentUser, userProfile, isCheckingUser } = useAuthStore();

//   if (isCheckingUser) {
//     return <div className="h-screen flex items-center justify-center">Loading...</div>;
//   }

//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   if (userProfile?.role !== "admin") {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export default AdminRoute;
