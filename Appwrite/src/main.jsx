
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import App from './App';
import "leaflet/dist/leaflet.css";
import GuestLayout from './layouts/GuestLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import { Register } from './pages/public/Register';
import ProtectedRoute from './Routes/ProtectedRoute';
import AdminRoute from './Routes/AdminRoute';
import FindRide from './pages/user/FindRide';
import PublishRide from './pages/user/PublishRide';
import MyRides from './pages/user/MyRides';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverRequest from './pages/admin/DriverRequest';
import AuthInitializer from './Components/AuthInitializer';
import { Toaster } from 'sonner';
import MyProfile from './pages/user/MyProfile';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})


const router = createBrowserRouter([

  {
    element: <GuestLayout />,
    children: [
      { path: "/", element: <Home /> },

    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/findaRide", element: <FindRide /> },
          { path: "/publishaRide", element: <PublishRide /> },
          { path: "/myRide", element: <MyRides /> },
          { path: "/myProfile", element: <MyProfile /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <AdminDashboard /> },
          { path: "/admin/driver-request", element: <DriverRequest /> },
        ],
      },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

])

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Toaster richColors position="top-right" />
    <AuthInitializer>
      <RouterProvider router={router} />
    </AuthInitializer>
  </QueryClientProvider>
)
