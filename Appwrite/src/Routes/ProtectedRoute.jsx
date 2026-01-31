import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";


const ProtectedRoute = () => {
  const { currentUser, isCheckingUser } = useAuthStore();

  if (isCheckingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
