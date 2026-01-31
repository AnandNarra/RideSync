import AppwriteAccount from "@/appwrite/AccountServices";
import useAuthStore from "@/store/authStore";
import React from "react";
import { useNavigate } from "react-router";

const Navbar = () => {

  const navigate = useNavigate();

  const { currentUser , setCurrentUser } = useAuthStore();

  const appwriteAccount = new AppwriteAccount();
const handleLogOut = async () => { 
    try {
      await appwriteAccount.logout(); 
      setCurrentUser(null);           
      navigate('/');                   
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-blue-600" onClick={()=> navigate('/')}>
              RideSync
            </span>
          </div>

          {/* Center Menu */}
          <ul className="hidden md:flex items-center gap-10 text-sm font-semibold text-gray-700">
            <li className="relative cursor-pointer hover:text-blue-600 transition" onClick={()=> navigate('/findaRide')}>
              Find a Ride
              <span className="absolute -bottom-1 left-0 h[2px] w-0 bg-blue-600 transition-all group-hover:w-full"></span>
            </li>
            <li className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate('/publishaRide')}>
              Publish a Ride
            </li>
            <li className="cursor-pointer hover:text-blue-600 transition" onClick={()=> navigate('/myRide')}>
              My Rides
            </li>
          </ul>

{
  currentUser ?  (<div className="flex items-center gap-3">
            
            <button className="px-5 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all" onClick={handleLogOut} >
              Logout 
            </button>
          </div>) : (<div className="flex items-center gap-3">
            <button className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition" onClick={()=>navigate('/login')}>
              Login
            </button>
            <button className="px-5 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"onClick={() => navigate("/register")}>
              Sign Up
            </button>
          </div>)
}

          {/* Auth Buttons */}
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
