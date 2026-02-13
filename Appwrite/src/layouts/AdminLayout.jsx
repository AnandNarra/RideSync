import { Link, Outlet, useNavigate } from "react-router";
import { useLogout } from "@/api's/user/user.query";
import useAuthStore from "@/store/authStore";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mutate: logoutUser, isPending } = useLogout();
  const logoutStore = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        logoutStore();   // ✅ clear Zustand + storage
        navigate("/");
      },
      onError: (error) => {
        console.error("Logout failed:", error);

        // fallback: force logout anyway
        logoutStore();
        navigate("/");
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col h-screen sticky top-0">
        <div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
          {user && (
            <div className="mt-4 pb-4 border-b border-gray-700">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
        </div>

        <ul className="mt-6 space-y-3 flex-1">
          <li>
            <Link to="/admin" className="hover:text-gray-300 cursor-pointer block py-2">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/driver-request" className="hover:text-gray-300 cursor-pointer block py-2">Driver Requests</Link>
          </li>
        </ul>

        <div className="mt-auto pt-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
