import { Link, Outlet } from "react-router";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <ul className="mt-6 space-y-3">
          <li>
            <Link to="/admin" className="hover:text-gray-300 cursor-pointer">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/driver-request" className="hover:text-gray-300 cursor-pointer">Driver Requests</Link>
          </li>
        </ul>
      </aside>

      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
