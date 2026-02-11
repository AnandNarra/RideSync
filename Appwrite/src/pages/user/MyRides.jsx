import { useGetMyRides, useCancelRide } from "@/api's/driver's/driver's.query";
import React from "react";
import { useNavigate } from "react-router";
import { MapPin, Calendar, Clock, Users, ChevronRight, MessageSquare, CheckCircle2, MoreVertical, XCircle } from 'lucide-react';
import { toast } from "sonner";

const MyRides = () => {
  const { data, isLoading } = useGetMyRides();
  const { mutate: cancelRide, isPending: isCancelling } = useCancelRide();
  const navigate = useNavigate();

  const handleCancel = (rideId) => {
    if (window.confirm("Are you sure you want to cancel this ride? This will also cancel all associated bookings.")) {
      cancelRide(rideId);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My <span className="text-blue-600">Published</span> Rides</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your active listings and passenger requests.</p>
          </div>
          <button
            onClick={() => navigate('/publishaRide')}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-3"
          >
            Publish New Ride
          </button>
        </div>

        <div className="grid gap-8">
          {data.data.map((ride) => (
            <div
              key={ride._id}
              className={`group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5 hover:shadow-2xl transition-all duration-500 ${ride.status === 'cancelled' ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              <div className="p-8 md:p-10">
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ride.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' :
                          ride.status === 'filled' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            ride.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                              ride.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                        {ride.status}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-xs font-bold text-slate-600">{new Date(ride.departureTime).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="relative pl-10 space-y-8">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-dashed bg-slate-200" />
                      <div className="relative">
                        <div className="absolute -left-10 top-1 w-6 h-6 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center z-10">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pick up Location</p>
                        <p className="text-lg font-black text-slate-900">{ride.startLocation.name}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-10 top-1 w-6 h-6 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center z-10">
                          <MapPin size={12} className="text-slate-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                        <p className="text-lg font-black text-slate-900">{ride.endLocation.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-50 pt-10 lg:pt-0 lg:pl-10">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-5 rounded-3xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Available</p>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-600" />
                          <span className="text-xl font-black text-slate-900">{ride.availableSeats}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-3xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Price/Seat</p>
                        <span className="text-xl font-black text-slate-900">₹{ride.pricePerSeat}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {ride.status === 'published' || ride.status === 'filled' ? (
                        <>
                          <button
                            onClick={() => navigate('/bookingRequests')}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                          >
                            <MessageSquare size={16} />
                            View Requests
                          </button>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleCancel(ride._id)}
                              disabled={isCancelling}
                              className="flex-1 py-4 bg-white text-red-500 border border-red-50 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              <XCircle size={14} />
                              Cancel Ride
                            </button>
                            <button className="w-14 items-center justify-center flex bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-[2rem] text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trip Status</p>
                          <p className="text-sm font-bold text-slate-600 mt-1 capitalize">{ride.status}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRides;
