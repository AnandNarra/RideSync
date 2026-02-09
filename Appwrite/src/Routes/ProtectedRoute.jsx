import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";


const ProtectedRoute = () => {
  const { user, isCheckingUser } = useAuthStore();

  if (isCheckingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        ProtectedRoute: Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin users to admin dashboard
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
