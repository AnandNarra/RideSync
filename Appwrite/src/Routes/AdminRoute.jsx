import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

const AdminRoute = () => {
  const { user, isCheckingUser } = useAuthStore();

  if (isCheckingUser) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
