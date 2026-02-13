import React from 'react';
import { useGetMyBookings, useUpdateBooking, useCancelBooking } from "../../api's/booking/booking.query";
import { Clock, MapPin, User, ShieldCheck, MessageSquare, Calendar, ChevronRight, MoreVertical, X, Check, Users, Trash2 } from 'lucide-react';

const MyBookings = () => {
    const { data: bookingsData, isLoading } = useGetMyBookings();
    const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking();
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your <span className="text-blue-600 underline underline-offset-8 decoration-4 decoration-blue-100">Bookings</span></h1>
                    <p className="text-slate-500 mt-4 font-medium">Track your travel requests and journeys.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-white/50 animate-pulse rounded-[3rem] border border-slate-100" />
                        ))}
                    </div>
                ) : !bookingsData || bookingsData?.data?.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Calendar size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">No bookings yet</h3>
                        <p className="text-slate-400 mt-3 max-w-[320px] mx-auto font-medium">Ready for your next adventure? Find a ride and start sharing!</p>
                        <button className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
                            Find a Ride
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {bookingsData.data.map((booking) => (
                            <div key={booking._id} className="group bg-white rounded-[3rem] p-8 md:p-10 shadow-xl shadow-slate-900/5 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-blue-900/10 border-l-[12px] border-l-blue-600 relative overflow-hidden">
                                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                                    <div className="flex-1 space-y-8">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-400">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black">{new Date(booking.rideId.departureTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-400">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-black">{new Date(booking.rideId.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From</p>
                                                <p className="text-2xl font-black text-slate-900 tracking-tight">{booking.rideId.startLocation.name.split(',')[0]}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <ChevronRight size={20} className="text-slate-300" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To</p>
                                                <p className="text-2xl font-black text-slate-900 tracking-tight">{booking.rideId.endLocation.name.split(',')[0]}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex md:flex-col gap-6 items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-50 pt-8 md:pt-0 md:pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.rideId.driverId?.fullName}</p>
                                                <p className="text-sm font-bold text-slate-900">Driver</p>
                                            </div>
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-slate-50 shadow-xl bg-slate-100 flex items-center justify-center">
                                                {booking.rideId.driverId?.profilePhoto ? (
                                                    <img src={booking.rideId.driverId.profilePhoto} alt="Driver" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={24} className="text-slate-300" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{booking.seatsRequested} Seats Requested</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tight">₹{booking.rideId.pricePerSeat * booking.seatsRequested}</p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full">
                                            {booking.status === 'accepted' && (
                                                <button className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
                                                    <MessageSquare size={16} />
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
                                                        className="w-12 h-12 items-center justify-center flex bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenu === booking._id && (
                                                        <div className="absolute right-0 bottom-full mb-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                            <button
                                                                onClick={() => handleEditClick(booking)}
                                                                className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                                                            >
                                                                <Users size={14} />
                                                                Edit Booking
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(booking._id)}
                                                                className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                                                            >
                                                                <Trash2 size={14} />
                                                                Cancel Booking
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Booking Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3.5rem] p-10 md:p-14 max-w-lg w-full mx-4 shadow-2xl overflow-hidden relative border border-white">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Edit <span className="text-blue-600 underline underline-offset-8 decoration-4 decoration-blue-100">Booking</span></h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-4">Adjust your requested seats</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-10 mb-12">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Number of Seats</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Users size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedBooking?.rideId?.availableSeats + selectedBooking?.seatsRequested}
                                        value={editSeats}
                                        onChange={(e) => setEditSeats(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-blue-50 rounded-3xl py-5 pl-16 pr-8 text-lg font-black text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 ml-1">
                                    Maximum available: {selectedBooking?.rideId?.availableSeats + selectedBooking?.seatsRequested} seats
                                </p>
                            </div>

                            <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Price</span>
                                    <span className="text-3xl font-black text-blue-900">₹{selectedBooking?.rideId?.pricePerSeat * editSeats}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSubmit}
                                disabled={isUpdating}
                                className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isUpdating ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check size={20} />
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
