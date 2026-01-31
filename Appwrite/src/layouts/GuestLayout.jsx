
import { Outlet } from "react-router";
import Navbar from "../Components/Navbar";
import Footer from "@/Components/Footer";

const GuestLayout = () => {
  return (
    <>
      <Navbar/>
      <Outlet />
      <Footer/>
    </>
  );
};

export default GuestLayout;
