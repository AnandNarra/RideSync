import useAuthStore from '@/store/authStore';
import { useLogout, useUpdateProfile } from "@/api's/user/user.query";
import { useGetMyBookings } from "@/api's/booking/booking.query";
import { useGetMyRides } from "@/api's/driver's/driver's.query";
import { useGetBookingRequests } from "@/api's/booking/booking.query";
import { getMyProfile } from "@/api's/user/user.api";
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  User, Mail, Phone, Shield, LogOut, Calendar, Camera, MapPin, Star,
  Award, Settings, ChevronRight, Check, X,
  Car, BookOpen, Users, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const MyProfile = () => {
  const { user, setUser } = useAuthStore();
  const { mutate: logoutUser } = useLogout();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const clearStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Counts for Quick Access cards
  const { data: myBookingsData } = useGetMyBookings();
  const { data: myRidesData } = useGetMyRides();
  const { data: requestsData } = useGetBookingRequests(null);
  const myBookingsCount = myBookingsData?.data?.length ?? '—';
  const myRidesCount = myRidesData?.data?.length ?? '—';
  const pendingRequestsCount = requestsData?.data?.filter(r => r.status === 'pending')?.length ?? '—';
  const [isLoading, setIsLoading] = React.useState(!user);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editData, setEditData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || ''
  });
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) setIsLoading(true);
        const data = await getMyProfile();
        setUser(data.user);
      } catch (error) {
        if (!user) toast.error('Could not load profile details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [setUser]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fd = new FormData();
      fd.append('profilePhoto', file);
      updateProfile(fd);
    }
  };

  const handleSaveProfile = () => {
    const fd = new FormData();
    Object.entries(editData).forEach(([k, v]) => fd.append(k, v));
    updateProfile(fd, { onSuccess: () => setShowEditModal(false) });
  };

  const handleLogout = () =>
    logoutUser(null, {
      onSuccess: () => {
        clearStore();
        queryClient.clear();
        toast.success('Logged out. See you soon! 👋');
        navigate('/login');
      },
      onError: () => toast.error('Logout failed.')
    });

  if (isLoading && !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Syncing Profile...</p>
      </div>
    </div>
  );

  // Quick-access navigation cards shown below Personal Info
  const quickLinks = [
    {
      label: 'My Rides',
      desc: 'Rides you have booked',
      count: myBookingsCount,
      countLabel: 'bookings',
      route: '/myRides',
      icon: <BookOpen size={22} />,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    ...(user?.role === 'driver' ? [
      {
        label: 'Published Rides',
        desc: 'Rides you have published',
        count: myRidesCount,
        countLabel: 'rides',
        route: '/publishedRides',
        icon: <Car size={22} />,
        gradient: 'from-violet-500 to-violet-600',
        bg: 'bg-violet-50',
        text: 'text-violet-600',
      },
      {
        label: 'Requests',
        desc: 'Pending passenger requests',
        count: pendingRequestsCount,
        countLabel: 'pending',
        route: '/requests',
        icon: <Users size={22} />,
        gradient: 'from-rose-500 to-rose-600',
        bg: 'bg-rose-50',
        text: 'text-rose-600',
      },
    ] : []),
  ];

  const infoCards = [
    { label: 'Full Name', value: user?.fullName, icon: <User className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Email', value: user?.email, icon: <Mail className="text-purple-500" />, color: 'bg-purple-50' },
    { label: 'Phone', value: user?.phoneNumber, icon: <Phone className="text-green-500" />, color: 'bg-green-50' },
    { label: 'Role', value: user?.role, icon: <Shield className="text-amber-500" />, color: 'bg-amber-50' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A', icon: <Calendar className="text-rose-500" />, color: 'bg-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Profile header card */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100 bg-blue-50 text-blue-600">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'driver' ? 'Driver' : 'Member'}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-xl bg-gray-50 border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                {user?.profilePhoto
                  ? <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  : <User size={40} className="text-gray-300" />}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="absolute bottom-1 -right-1 w-9 h-9 bg-blue-600 text-white rounded-lg shadow-md border-2 border-white flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
              </button>
            </div>

            {/* Name + badges */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user?.fullName || user?.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <Star className="text-amber-400 fill-amber-400" size={10} />4.9 Rating
                </span>
                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                <span className="flex items-center gap-1 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <Award className="text-blue-500" size={10} />Verified
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-gray-50 text-gray-600 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-2 border border-gray-100"
            >
              <LogOut size={14} />Sign Out
            </button>
          </div>
        </div>

        {/* Profile content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                  Personal <span className="text-blue-600">Information</span>
                </h3>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-gray-100"
                  title="Edit Profile"
                >
                  <Settings size={18} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {infoCards.map((card, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}>
                        {React.cloneElement(card.icon, { size: 14 })}
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">{card.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access */}
            {quickLinks.length > 0 && (
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-6">
                  Quick <span className="text-blue-600">Access</span>
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {quickLinks.map((link) => (
                    <button
                      key={link.route}
                      onClick={() => navigate(link.route)}
                      className="group flex flex-col items-start p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 ${link.bg} rounded-lg flex items-center justify-center ${link.text}`}>
                          {React.cloneElement(link.icon, { size: 18 })}
                        </div>
                        <p className="font-bold text-xs text-gray-900">{link.label}</p>
                      </div>
                      <div className="mt-auto w-full flex items-end justify-between">
                        <div>
                          <p className={`text-2xl font-bold ${link.text} leading-none`}>{link.count}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{link.countLabel}</p>
                        </div>
                        <ArrowRight size={14} className={`${link.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 text-white shadow-sm overflow-hidden relative group border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Driver Center</h3>
              <p className="text-gray-400 text-xs mb-5 leading-relaxed">Complete your profile to unlock more features.</p>
              <button
                onClick={() => navigate('/driverRegistration')}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight size={12} />
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 opacity-60">Account Settings</h3>
              <div className="space-y-1">
                {[
                  { label: 'Wallet & Payment', icon: <MapPin size={14} /> },
                  { label: 'Notifications', icon: <Settings size={14} /> },
                  { label: 'Privacy Policy', icon: <Shield size={14} /> }
                ].map((link, i) => (
                  <button key={i} className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">{link.icon}</div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 uppercase tracking-widest">{link.label}</span>
                    </div>
                    <ChevronRight size={12} className="text-gray-200 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Edit Profile</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Update your personal details</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Username', key: 'name', icon: <User size={14} />, type: 'text' },
                { label: 'Full Name', key: 'fullName', icon: <Award size={14} />, type: 'text' },
                { label: 'Email', key: 'email', icon: <Mail size={14} />, type: 'email' },
                { label: 'Phone Number', key: 'phoneNumber', icon: <Phone size={14} />, type: 'text' },
              ].map(({ label, key, icon, type }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">{label}</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">{icon}</div>
                    <input
                      type={type}
                      value={editData[key]}
                      onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all">
                Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={isUpdating} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={14} />Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;