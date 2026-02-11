import { useSearchParams } from 'react-router';
import { useGetBookingRequests, useAcceptBooking, useRejectBooking } from "../../api's/booking/booking.query";
import { Users, MapPin, Clock, Calendar, Check, X, User, Phone, Mail, FilterX } from 'lucide-react';

const BookingRequests = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const rideId = searchParams.get('rideId');

    const { data: requestsData, isLoading } = useGetBookingRequests(rideId);
    const { mutate: acceptBooking, isPending: isAccepting } = useAcceptBooking();
    const { mutate: rejectBooking, isPending: isRejecting } = useRejectBooking();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking <span className="text-blue-600">Requests</span></h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your passengers and fill your empty seats.</p>

                    {rideId && (
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-3">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Filtering by Ride</p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="p-1 hover:bg-blue-100 rounded-lg transition-all text-blue-600"
                                    title="Show all requests"
                                >
                                    <FilterX size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-white/50 animate-pulse rounded-[3rem] border border-slate-100" />
                        ))}
                    </div>
                ) : !requestsData || requestsData?.data?.length === 0 ? (
                    <div className="max-w-md mx-auto text-center py-20 bg-white rounded-[3rem] shadow-xl shadow-blue-900/5 border border-slate-50">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-blue-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">No pending requests</h3>
                        <p className="text-slate-400 mt-2 px-8">When passengers book your rides, their requests will appear here for your approval.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {requestsData.data.map((request) => (
                            <div key={request._id} className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5 hover:shadow-2xl transition-all duration-500">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-slate-50 shadow-xl bg-slate-100 flex items-center justify-center">
                                                {request.passengerId?.profilePhoto ? (
                                                    <img src={request.passengerId.profilePhoto} alt="Passenger" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={28} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-none">{request.passengerId?.fullName}</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                                                        <Users size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">{request.seatsRequested} Seats</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Earnings</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{request.rideId.pricePerSeat * request.seatsRequested}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                <MapPin size={14} className="text-green-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Route Details</p>
                                                <p className="text-xs font-bold text-slate-700 truncate">
                                                    {request.rideId.startLocation.name.split(',')[0]} → {request.rideId.endLocation.name.split(',')[0]}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={14} className="text-slate-400" />
                                                <p className="text-xs font-bold text-slate-700">{new Date(request.rideId.departureTime).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock size={14} className="text-slate-400" />
                                                <p className="text-xs font-bold text-slate-700">{new Date(request.rideId.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <button
                                            onClick={() => acceptBooking(request._id)}
                                            disabled={isAccepting || isRejecting}
                                            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                        >
                                            {isAccepting ? (
                                                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Check size={16} />
                                                    <span>Accept</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => rejectBooking(request._id)}
                                            disabled={isAccepting || isRejecting}
                                            className="flex items-center justify-center gap-2 bg-white text-slate-400 border border-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-red-500 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isRejecting ? (
                                                <div className="h-4 w-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <X size={16} />
                                                    <span>Reject</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 p-4 border-t border-slate-50 flex items-center justify-around">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                        <Phone size={10} />
                                        <span>{request.passengerId?.phoneNumber || "N/A"}</span>
                                    </div>
                                    <div className="w-px h-3 bg-slate-200" />
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                        <Mail size={10} />
                                        <span>{request.passengerId?.email?.split('@')[0]}...</span>
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

export default BookingRequests;
