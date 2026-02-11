import React from 'react';
import { useGetMyBookings } from "../../api's/booking/booking.query";
import { Clock, MapPin, User, ShieldCheck, MessageSquare, Calendar, ChevronRight } from 'lucide-react';

const MyBookings = () => {
    const { data: bookingsData, isLoading } = useGetMyBookings();

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your <span className="text-blue-600">Bookings</span></h1>
                    <p className="text-slate-500 mt-2 font-medium">Track your travel requests and journeys.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-white/50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                        ))}
                    </div>
                ) : !bookingsData || bookingsData?.data?.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-xl shadow-slate-900/5">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">No bookings yet</h3>
                        <p className="text-slate-400 mt-2 max-w-[280px] mx-auto">Ready for your next adventure? Find a ride and start sharing!</p>
                        <button className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                            Find a Ride
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookingsData.data.map((booking) => (
                            <div key={booking._id} className="group bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-blue-900/5 border-l-8 border-l-blue-600">
                                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-slate-400">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-bold">{new Date(booking.rideId.departureTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-slate-400">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-bold">{new Date(booking.rideId.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</p>
                                                <p className="text-lg font-black text-slate-900">{booking.rideId.startLocation.name.split(',')[0]}</p>
                                            </div>
                                            <div className="px-4 py-2 bg-slate-50 rounded-2xl">
                                                <ChevronRight size={16} className="text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To</p>
                                                <p className="text-lg font-black text-slate-900">{booking.rideId.endLocation.name.split(',')[0]}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex md:flex-col gap-4 items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">{booking.rideId.driverId?.fullName}</p>
                                                <p className="text-xs font-bold text-slate-900">Driver</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-slate-50 shadow-lg bg-slate-100 flex items-center justify-center">
                                                {booking.rideId.driverId?.profilePhoto ? (
                                                    <img src={booking.rideId.driverId.profilePhoto} alt="Driver" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-slate-300" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{booking.seatsRequested} Seats</p>
                                            <p className="text-2xl font-black text-slate-900">₹{booking.rideId.pricePerSeat * booking.seatsRequested}</p>
                                        </div>

                                        {booking.status === 'accepted' && (
                                            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 group-hover:translate-y-[-2px]">
                                                <MessageSquare size={14} />
                                                <span>Chat Enabled</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
