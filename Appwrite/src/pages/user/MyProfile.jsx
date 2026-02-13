import useAuthStore from '@/store/authStore';
import { useLogout, useUpdateProfile } from "@/api's/user/user.query";
import { getMyProfile } from "@/api's/user/user.api";
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { User, Mail, Phone, Shield, LogOut, Calendar, Camera, MapPin, Star, Award, Settings, ChevronRight, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const MyProfile = () => {
  const { user, setUser } = useAuthStore();
  const { mutate: logoutUser } = useLogout();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const clearStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      updateProfile(formData);
    }
  };

  const handleSaveProfile = () => {
    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('email', editData.email);
    formData.append('fullName', editData.fullName);
    formData.append('phoneNumber', editData.phoneNumber);

    updateProfile(formData, {
      onSuccess: () => setShowEditModal(false)
    });
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If we don't have user in store, show loading
        if (!user) setIsLoading(true);

        const data = await getMyProfile();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // We don't toast error here if we already have stale data from store to avoid noise
        if (!user) toast.error("Could not load profile details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setUser]); // Dependencies: only setUser which is stable from zustand

  const handleLogout = () => {
    logoutUser(null, {
      onSuccess: () => {
        clearStore();
        queryClient.clear(); // Wipe the global query cache
        toast.success("Successfully logged out. See you soon! 👋");
        navigate('/login');
      },
      onError: () => {
        toast.error("Logout failed. Please try again.");
      }
    });
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Syncing Profile...</p>
        </div>
      </div>
    );
  }

  const infoCards = [
    { label: 'Full Name', value: user?.fullName, icon: <User className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Email Address', value: user?.email, icon: <Mail className="text-purple-500" />, color: 'bg-purple-50' },
    { label: 'Phone Number', value: user?.phoneNumber, icon: <Phone className="text-green-500" />, color: 'bg-green-50' },
    { label: 'Account Role', value: user?.role, icon: <Shield className="text-amber-500" />, color: 'bg-amber-50' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A', icon: <Calendar className="text-rose-500" />, color: 'bg-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header / Hero Section */}
      <div className="relative h-80 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-slate-50/50 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10 pb-20">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-white mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 bg-blue-50 text-blue-600 underline-offset-4 decoration-2`}>
              {user?.role === 'admin' ? 'System Administrator' : user?.role === 'driver' ? 'Pro Driver' : 'Elite Member'}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 border-8 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <User size={64} className="text-slate-300" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="absolute bottom-2 -right-2 w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center border-4 border-white hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={18} />}
              </button>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">{user?.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">
                  <Star className="text-amber-400 fill-amber-400" size={14} />
                  <span>4.9 Rating</span>
                </div>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">
                  <Award className="text-blue-500" size={14} />
                  <span>Verified</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={handleLogout}
                className="flex-1 md:flex-none px-8 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-50">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personal <span className="text-blue-600 underline underline-offset-8 decoration-4 decoration-blue-100">Information</span></h3>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-95"
                  title="Edit Profile"
                >
                  <Settings size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {infoCards.map((card, index) => (
                  <div key={index} className="group p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                        {card.icon}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{card.label}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 pl-1 truncate" title={card.value}>{card.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity / Stats */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Ride <span className="text-blue-600 underline underline-offset-8 decoration-4 decoration-blue-100">Statistics</span></h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Total Rides', count: '48', color: 'text-blue-600' },
                  { label: 'CO2 Saved', count: '124kg', color: 'text-green-600' },
                  { label: 'Travelled', count: '1.2k km', color: 'text-purple-600' }
                ].map((stat, i) => (
                  <div key={i} className="text-center p-6 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                    <p className={`text-[22px] font-black ${stat.color} mb-1 leading-none transition-transform group-hover:scale-125`}>{stat.count}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
              <h3 className="text-xl font-black leading-tight mb-4 relative z-10">Complete Your <br />Verification</h3>
              <p className="text-blue-100 text-xs font-medium mb-6 leading-relaxed relative z-10">Add your driving documents to earn the "Pro Driver" badge and higher visibility.</p>
              <button
                onClick={() => navigate('/driverRegistration')}
                className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group relative z-10 active:scale-95"
              >
                Get Started
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 px-2 opacity-30">Account Management</h3>
              <div className="space-y-2">
                {[
                  { label: 'Wallet & Payment', icon: <MapPin size={16} /> },
                  { label: 'Notification Settings', icon: <Settings size={16} /> },
                  { label: 'Privacy Policy', icon: <Shield size={16} /> }
                ].map((link, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-md transition-all">
                        {link.icon}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-widest">{link.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full mx-4 shadow-2xl overflow-hidden relative border border-white">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit <span className="text-blue-600 underline underline-offset-8 decoration-4 decoration-blue-100">Profile</span></h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-3">Update your personal account details</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <Award size={16} />
                  </div>
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Email Address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    value={editData.phoneNumber}
                    onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                    placeholder="Phone Number"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;