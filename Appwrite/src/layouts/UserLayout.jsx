import Navbar from "../Components/Navbar";
import { Outlet } from "react-router";

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </>
  );
};

export default UserLayout;
