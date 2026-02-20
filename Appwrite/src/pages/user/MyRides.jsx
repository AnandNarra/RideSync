import { useGetMyRides, useCancelRide, useUpdateRide } from "@/api's/driver's/driver's.query";
import React from "react";
import { useNavigate } from "react-router";
import {
  MapPin, Calendar, Clock, Users, MessageSquare,
  MoreVertical, XCircle, X, Check, ChevronDown, ChevronUp,
  User, Phone, CheckCircle2, AlertCircle, Ban
} from 'lucide-react';
import { toast } from "sonner";

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  completed: { label: 'Completed', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const BookingStatusIcon = ({ status }) => {
  if (status === 'accepted') return <CheckCircle2 size={13} className="text-green-600" />;
  if (status === 'rejected' || status === 'cancelled') return <Ban size={13} className="text-red-400" />;
  return <AlertCircle size={13} className="text-amber-500" />;
};

const MyRides = () => {
  const { data, isLoading } = useGetMyRides();
  const { mutate: cancelRide, isPending: isCancelling } = useCancelRide();
  const { mutate: updateRide, isPending: isUpdating } = useUpdateRide();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = React.useState(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedRide, setSelectedRide] = React.useState(null);
  const [expandedBookings, setExpandedBookings] = React.useState({});
  const [editData, setEditData] = React.useState({
    startLocation: { name: '', coordinates: [] },
    endLocation: { name: '', coordinates: [] },
    departureTime: '',
    totalSeats: 1,
    pricePerSeat: 0
  });

  const toggleBookings = (rideId) => {
    setExpandedBookings(prev => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const handleEditClick = (ride) => {
    setSelectedRide(ride);
    setEditData({
      startLocation: { name: ride.startLocation.name, coordinates: ride.startLocation.coordinates },
      endLocation: { name: ride.endLocation.name, coordinates: ride.endLocation.coordinates },
      departureTime: new Date(ride.departureTime).toISOString().slice(0, 16),
      totalSeats: ride.totalSeats,
      pricePerSeat: ride.pricePerSeat
    });
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleUpdateSubmit = () => {
    updateRide({ rideId: selectedRide._id, payload: editData }, {
      onSuccess: () => setShowEditModal(false)
    });
  };

  const handleCancel = (rideId) => {
    if (window.confirm("Are you sure you want to cancel this ride? This will also cancel all associated bookings.")) {
      cancelRide(rideId);
      setActiveMenu(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Calendar size={40} className="text-blue-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">No rides yet</h3>
          <p className="text-slate-400 mt-2 mb-10 font-medium">You haven't published any shared journeys yet. Ready to start your first one?</p>
          <button
            onClick={() => navigate('/publishaRide')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
          >
            Publish a Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My <span className="text-blue-600">Published</span> Rides</h1>
            <p className="text-gray-500 mt-2">Manage your active listings and passenger requests.</p>
          </div>
          <button
            onClick={() => navigate('/publishaRide')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
          >
            Publish New Ride
          </button>
        </div>

        <div className="grid gap-6">
          {data.data.map((ride) => {
            const bookings = ride.bookings || [];
            const activeBookings = bookings.filter(b => b.status !== 'rejected' && b.status !== 'cancelled');
            const isExpanded = expandedBookings[ride._id];

            return (
              <div
                key={ride._id}
                className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300
                  ${ride.status === 'cancelled' ? 'opacity-80' : ''}`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    {/* Left: Route Info */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ride.status === 'published' ? 'bg-green-50 text-green-700 border-green-100' :
                          ride.status === 'filled' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            ride.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                              ride.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                          {ride.status}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar size={12} />
                          <span className="text-xs font-semibold">{new Date(ride.departureTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock size={12} />
                          <span className="text-xs font-semibold">{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="relative pl-8 space-y-6">
                        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-100" />
                        <div className="relative">
                          <div className="absolute -left-8 top-1 w-5 h-5 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center z-10">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pickup</p>
                          <p className="text-base font-bold text-gray-900">{ride.startLocation.name}</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-8 top-1 w-5 h-5 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center z-10">
                            <MapPin size={10} className="text-gray-400" />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Destination</p>
                          <p className="text-base font-bold text-gray-900">{ride.endLocation.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stats + Actions */}
                    <div className="w-full lg:w-72 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8 lg:border-l border-gray-100">
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Seats</p>
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-blue-600" />
                            <span className="text-sm font-bold text-gray-900">
                              {ride.availableSeats}/{ride.totalSeats}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price</p>
                          <span className="text-base font-bold text-gray-900">₹{ride.pricePerSeat}</span>
                        </div>
                      </div>

                      {bookings.length > 0 && (
                        <button
                          onClick={() => toggleBookings(ride._id)}
                          className="mb-4 flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider border border-gray-100"
                        >
                          <span className="flex items-center gap-2">
                            <Users size={12} />
                            {activeBookings.length} Passenger{activeBookings.length !== 1 ? 's' : ''}
                          </span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        {ride.status === 'published' || ride.status === 'filled' ? (
                          <>
                            <button
                              onClick={() => navigate(`/requests?rideId=${ride._id}`)}
                              className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                              <MessageSquare size={14} />
                              Requests
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenu(activeMenu === ride._id ? null : ride._id);
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {activeMenu === ride._id && (
                                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-[60] py-1">
                                  <button
                                    onClick={() => handleEditClick(ride)}
                                    className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Clock size={12} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleCancel(ride._id)}
                                    disabled={isCancelling}
                                    className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <XCircle size={12} />
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-center w-full border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Status</p>
                            <p className="text-xs font-bold text-gray-600 mt-1 capitalize">{ride.status}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Bookings Panel */}
                {isExpanded && bookings.length > 0 && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/30">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-3">Passenger Details</p>
                    <div className="grid gap-2">
                      {bookings.map((booking) => {
                        const passenger = booking.passengerId;
                        const cfg = statusConfig[booking.status] || statusConfig.pending;
                        return (
                          <div
                            key={booking._id}
                            className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-100 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100">
                                {passenger?.profilePhoto ? (
                                  <img src={passenger.profilePhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                    <User size={14} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{passenger?.fullName || 'Passenger'}</p>
                                <p className="text-[10px] text-gray-400 font-medium">Requested {booking.seatsRequested} Seats</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
                                {cfg.label}
                              </div>
                              {booking.status === 'accepted' && (
                                <button
                                  onClick={() => navigate(`/chat/${booking._id}`)}
                                  className="p-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition-all"
                                >
                                  <MessageSquare size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ride Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Ride</h3>
                <p className="text-xs text-gray-400 mt-1">Update your ride details below.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Pickup Location</label>
                  <input
                    type="text"
                    value={editData.startLocation.name}
                    onChange={(e) => setEditData({ ...editData, startLocation: { ...editData.startLocation, name: e.target.value } })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Destination</label>
                  <input
                    type="text"
                    value={editData.endLocation.name}
                    onChange={(e) => setEditData({ ...editData, endLocation: { ...editData.endLocation, name: e.target.value } })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editData.departureTime}
                    onChange={(e) => setEditData({ ...editData, departureTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editData.totalSeats}
                    onChange={(e) => setEditData({ ...editData, totalSeats: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 text-gray-500 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={isUpdating}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} />
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

export default MyRides;
