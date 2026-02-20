import { useSearchParams, useNavigate } from 'react-router';
import { useGetBookingRequests, useAcceptBooking, useRejectBooking } from "../../api's/booking/booking.query";
import { Users, MapPin, Clock, Calendar, Check, X, User, Phone, Mail, FilterX, MessageSquare } from 'lucide-react';

const BookingRequests = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const rideId = searchParams.get('rideId');

    const { data: requestsData, isLoading } = useGetBookingRequests(rideId);
    const { mutate: acceptBooking, isPending: isAccepting } = useAcceptBooking();
    const { mutate: rejectBooking, isPending: isRejecting } = useRejectBooking();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Booking <span className="text-blue-600">Requests</span></h1>
                    <p className="text-gray-500 mt-2">Manage your passengers and fill your empty seats.</p>

                    {rideId && (
                        <div className="mt-6 flex items-center justify-center">
                            <div className="bg-white border border-gray-200 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Filter: Ride ID</p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-900"
                                    title="Show all requests"
                                >
                                    <FilterX size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-white animate-pulse rounded-xl border border-gray-100" />
                        ))}
                    </div>
                ) : !requestsData?.data?.filter(r => r.status === 'pending')?.length ? (
                    <div className="max-w-md mx-auto text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No pending requests</h3>
                        <p className="text-gray-500 mt-2 px-8 text-sm">When passengers book your rides, their requests will appear here for your approval.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {requestsData.data.filter(r => r.status === 'pending').map((request) => (
                            <div key={request._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                {request.passengerId?.profilePhoto ? (
                                                    <img src={request.passengerId.profilePhoto} alt="Passenger" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <User size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900">{request.passengerId?.fullName}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600">
                                                        <Users size={10} />
                                                        <span className="text-[10px] font-bold uppercase">{request.seatsRequested} Seats</span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Earnings</p>
                                            <p className="text-xl font-bold text-gray-900">₹{request.rideId.pricePerSeat * request.seatsRequested}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                                <MapPin size={12} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Route</p>
                                                <p className="text-xs font-bold text-gray-700 truncate">
                                                    {request.rideId.startLocation.name.split(',')[0]} → {request.rideId.endLocation.name.split(',')[0]}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 pl-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-gray-400" />
                                                <p className="text-xs font-semibold text-gray-600">{new Date(request.rideId.departureTime).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-gray-400" />
                                                <p className="text-xs font-semibold text-gray-600">{new Date(request.rideId.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => acceptBooking(request._id)}
                                            disabled={isAccepting || isRejecting}
                                            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-black transition-all disabled:opacity-50"
                                        >
                                            {isAccepting ? (
                                                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Check size={14} />
                                                    <span>Accept</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => rejectBooking(request._id)}
                                            disabled={isAccepting || isRejecting}
                                            className="flex items-center justify-center gap-2 bg-white text-gray-500 border border-gray-200 py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-50 hover:text-red-600 hover:border-red-100 transition-all disabled:opacity-50"
                                        >
                                            {isRejecting ? (
                                                <div className="h-4 w-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <X size={14} />
                                                    <span>Reject</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-around">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                        <Phone size={10} className="text-gray-300" />
                                        <span>{request.passengerId?.phoneNumber || "N/A"}</span>
                                    </div>
                                    <div className="w-px h-3 bg-gray-200" />
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                        <Mail size={10} className="text-gray-300" />
                                        <span className="truncate max-w-[120px]">{request.passengerId?.email}</span>
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
