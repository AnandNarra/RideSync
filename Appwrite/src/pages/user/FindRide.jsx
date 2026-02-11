import React, { useState, useEffect } from 'react';
import { useSearchRides } from "../../api's/ride/ride.query";
import { useBookRide } from "../../api's/booking/booking.query";
import Map from '../../utils/Map';
import LocationAutocomplete from '../../utils/LocationAutocomplete';
import { Search, MapPin, Users, Calendar, ArrowRight, User, Clock, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { toast } from "sonner";

const FindRide = () => {
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [searchParams, setSearchParams] = useState({
        seats: 1,
        date: ""
    });

    const [selectedRide, setSelectedRide] = useState(null);
    const [mapRoutes, setMapRoutes] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [seatsRequested, setSeatsRequested] = useState(1);

    const { data: ridesData, isLoading, refetch } = useSearchRides({
        from: pickup?.name,
        to: drop?.name,
        seats: searchParams.seats,
        date: searchParams.date
    });

    const { mutate: bookRide, isPending: isBooking } = useBookRide();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!pickup || !drop) {
            toast.error("Please select both pickup and drop locations");
            return;
        }
        refetch();
    };

    const handleRideSelect = (ride) => {
        setSelectedRide(ride);
        if (ride.route && ride.route.coordinates) {
            setMapRoutes([{ geometry: { coordinates: ride.route.coordinates }, distance: 0, duration: 0 }]);
        }
    };

    const handleConfirmBooking = () => {
        if (!selectedRide) return;

        bookRide({
            rideId: selectedRide._id,
            seatsRequested
        }, {
            onSuccess: () => {
                setIsBookingModalOpen(false);
                setSelectedRide(null);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Find Your <span className="text-blue-600">Journey</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Smart rides, shared moments.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Map */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden h-[600px] relative z-10 border border-slate-100 ring-1 ring-slate-200/50">
                            <Map
                                pickup={pickup}
                                drop={drop}
                                routes={mapRoutes}
                                selectedRouteIndex={0}
                            />

                            {/* Floating Selection Label */}
                            {!selectedRide && (
                                <div className="absolute top-6 right-6 z-[1000] p-1 rounded-2xl bg-white/20 backdrop-blur-3xl border border-white/30">
                                    <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Interactive Map</span>
                                    </div>
                                </div>
                            )}

                            {/* Glassmorphic Selected Ride Detail Overlay */}
                            {selectedRide && (
                                <div className="absolute inset-x-6 bottom-6 z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-500">
                                    <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase mb-0.5">Booking Details</h3>
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck size={12} className="text-blue-600" />
                                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Verified Provider</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedRide(null)}
                                                className="p-2 bg-white/60 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                                            >
                                                <ArrowRight size={18} className="rotate-45" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-white/50 p-3 rounded-2xl">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Calendar size={10} className="text-slate-400" />
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Departure</p>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-900">{new Date(selectedRide.departureTime).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-white/50 p-3 rounded-2xl">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Clock size={10} className="text-slate-400" />
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Time</p>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-900">{new Date(selectedRide.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsBookingModalOpen(true)}
                                            className="w-full relative overflow-hidden group bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                                        >
                                            <span className="relative z-10">Confirm Ride</span>
                                            <span className="relative z-10 w-1 h-1 rounded-full bg-white/40" />
                                            <span className="relative z-10">₹{selectedRide.pricePerSeat}</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Search & Results */}
                    <div className="space-y-8">
                        {/* Search Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-slate-100 ring-1 ring-slate-200/30">
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Pickup Location
                                        </label>
                                        <LocationAutocomplete
                                            placeholder="Where from?"
                                            onChange={setPickup}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            Destination
                                        </label>
                                        <LocationAutocomplete
                                            placeholder="Where to?"
                                            onChange={setDrop}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Date</label>
                                        <input
                                            type="date"
                                            value={searchParams.date}
                                            onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner outline-none ring-1 ring-slate-200/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Seats Need</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="6"
                                            value={searchParams.seats}
                                            onChange={(e) => setSearchParams({ ...searchParams, seats: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner outline-none ring-1 ring-slate-200/50"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full overflow-hidden group bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-sm transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Search size={18} className="group-hover:rotate-12 transition-transform" />
                                            <span>Find Available Rides</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Rides List */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Search Results</h2>
                                {ridesData?.count > 0 && (
                                    <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg shadow-blue-500/20 uppercase tracking-widest">
                                        {ridesData.count} RIDES
                                    </div>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="space-y-5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-slate-100/50 animate-pulse rounded-[2.5rem]" />
                                    ))}
                                </div>
                            ) : !ridesData || ridesData?.data?.length === 0 ? (
                                <div className="text-center py-16 px-8 bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search size={28} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Ready to travel?</h3>
                                    <p className="text-slate-500 text-sm mt-2 max-w-[240px] mx-auto leading-relaxed">Enter your destination to see available shared rides.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {ridesData?.data?.map((ride) => (
                                        <div
                                            key={ride._id}
                                            onClick={() => handleRideSelect(ride)}
                                            className={`group p-6 rounded-[2.5rem] cursor-pointer transition-all duration-400 border-2 active:scale-[0.98] ${selectedRide?._id === ride._id
                                                ? "bg-white border-blue-600 shadow-2xl shadow-blue-900/5"
                                                : "bg-white/60 border-transparent hover:border-slate-200 hover:bg-white"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100">
                                                            <Clock size={12} className="text-slate-500" />
                                                            <span className="text-[10px] font-black text-slate-700">
                                                                {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                                                            <ShieldCheck size={12} className="text-blue-600" />
                                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Verified</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-sm font-black text-slate-900">{ride.startLocation.name.split(',')[0]}</p>
                                                        <ArrowRight size={14} className="text-slate-300" />
                                                        <p className="text-sm font-black text-slate-900">{ride.endLocation.name.split(',')[0]}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Price</p>
                                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{ride.pricePerSeat}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5 mt-7 pt-5 border-t border-slate-50">
                                                <div className="h-14 w-14 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-slate-50">
                                                    {ride.driverId?.profilePhoto ? (
                                                        <img src={ride.driverId.profilePhoto} alt="Driver" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-blue-300">
                                                            <User size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate">{ride.driverId?.fullName || "Verified Driver"}</p>
                                                    <div className="flex items-center gap-4 mt-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Users size={12} className="text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{ride.availableSeats} Seats Left</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-all ${selectedRide?._id === ride._id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"}`}>
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && selectedRide && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsBookingModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 ring-1 ring-slate-200">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                                <Users size={32} className="text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Seats</h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium">How many people are traveling?</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-center gap-6">
                                <button
                                    onClick={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
                                    className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all font-black text-2xl border border-slate-100"
                                >
                                    -
                                </button>
                                <div className="text-5xl font-black text-slate-900 w-12 text-center tabular-nums">
                                    {seatsRequested}
                                </div>
                                <button
                                    onClick={() => setSeatsRequested(Math.min(selectedRide.availableSeats, seatsRequested + 1))}
                                    className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all font-black text-2xl border border-slate-100"
                                >
                                    +
                                </button>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-3xl space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span>Price per seat</span>
                                    <span className="text-slate-900">₹{selectedRide.pricePerSeat}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200/50">
                                    <span className="text-sm font-black text-slate-900">Total Amount</span>
                                    <span className="text-2xl font-black text-blue-600 tracking-tighter">₹{selectedRide.pricePerSeat * seatsRequested}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isBooking}
                                    className="w-full bg-slate-900 hover:bg-black text-white py-4.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isBooking ? (
                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>Request Booking</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="w-full bg-white text-slate-400 py-4.5 rounded-2xl font-black text-sm hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </div>
    );
};

export default FindRide;
