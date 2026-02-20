import React from 'react';
import { useNavigate } from 'react-router';
import { useGetMyBookings, useUpdateBooking, useCancelBooking } from "../../api's/booking/booking.query";
import { Clock, MapPin, User, ShieldCheck, MessageSquare, Calendar, ChevronRight, MoreVertical, X, Check, Users, Trash2 } from 'lucide-react';

const MyBookings = () => {
    const { data: bookingsData, isLoading } = useGetMyBookings();
    const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking();
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
    const navigate = useNavigate();

    const [activeMenu, setActiveMenu] = React.useState(null);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [selectedBooking, setSelectedBooking] = React.useState(null);
    const [editSeats, setEditSeats] = React.useState(1);

    const handleEditClick = (booking) => {
        setSelectedBooking(booking);
        setEditSeats(booking.seatsRequested);
        setShowEditModal(true);
        setActiveMenu(null);
    };

    const handleUpdateSubmit = () => {
        updateBooking({
            bookingId: selectedBooking._id,
            payload: { seatsRequested: editSeats }
        }, {
            onSuccess: () => setShowEditModal(false)
        });
    };

    const handleCancel = (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            cancelBooking(bookingId);
            setActiveMenu(null);
        }
    };

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
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Your <span className="text-blue-600">Bookings</span></h1>
                    <p className="text-gray-500 mt-2">Track your travel requests and journeys.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-white animate-pulse rounded-xl border border-gray-100" />
                        ))}
                    </div>
                ) : !bookingsData || bookingsData?.data?.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No bookings yet</h3>
                        <p className="text-gray-500 mt-2 max-w-[280px] mx-auto text-sm">Ready for your next adventure? Find a ride and start sharing!</p>
                        <button onClick={() => navigate('/findaRide')} className="mt-8 px-8 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-black transition-all">
                            Find a Ride
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookingsData.data.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all hover:shadow-md border-l-4 border-l-blue-600 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold">{new Date(booking.rideId.departureTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold">{new Date(booking.rideId.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">From</p>
                                            <p className="text-lg font-bold text-gray-900">{booking.rideId.startLocation.name.split(',')[0]}</p>
                                        </div>
                                        <div className="w-8 h-8 flex items-center justify-center text-gray-300">
                                            <ChevronRight size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">To</p>
                                            <p className="text-lg font-bold text-gray-900">{booking.rideId.endLocation.name.split(',')[0]}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex md:flex-col gap-6 items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{booking.rideId.driverId?.fullName}</p>
                                            <p className="text-xs font-bold text-gray-900">Driver</p>
                                        </div>
                                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                                            {booking.rideId.driverId?.profilePhoto ? (
                                                <img src={booking.rideId.driverId.profilePhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-gray-300" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{booking.seatsRequested} Seats</p>
                                        <p className="text-2xl font-bold text-gray-900">₹{booking.rideId.pricePerSeat * booking.seatsRequested}</p>
                                    </div>

                                    <div className="flex items-center gap-2 w-full">
                                        {booking.status === 'accepted' && (
                                            <button
                                                onClick={() => navigate(`/chat/${booking._id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-black transition-all"
                                            >
                                                <MessageSquare size={14} />
                                                Chat
                                            </button>
                                        )}

                                        {(booking.status === 'pending' || booking.status === 'accepted') && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === booking._id ? null : booking._id);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {activeMenu === booking._id && (
                                                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 overflow-hidden">
                                                        <button
                                                            onClick={() => handleEditClick(booking)}
                                                            className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Users size={12} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(booking._id)}
                                                            className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={12} />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Booking Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Edit Booking</h3>
                                <p className="text-xs text-gray-400 mt-1">Adjust your requested seats.</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Number of Seats</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedBooking?.rideId?.availableSeats + selectedBooking?.seatsRequested}
                                    value={editSeats}
                                    onChange={(e) => setEditSeats(Number(e.target.value))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 transition-all"
                                />
                                <p className="text-[10px] font-medium text-gray-400 mt-1 ml-0.5">
                                    Max available: {selectedBooking?.rideId?.availableSeats + selectedBooking?.seatsRequested} seats
                                </p>
                            </div>

                            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Total Price</span>
                                <span className="text-xl font-bold text-blue-900">₹{selectedBooking?.rideId?.pricePerSeat * editSeats}</span>
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
                                        Update trip
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

export default MyBookings;
