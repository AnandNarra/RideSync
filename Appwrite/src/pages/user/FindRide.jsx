import React, { useState, useEffect } from 'react';
import { useSearchRides } from "../../api's/ride/ride.query";
import { useBookRide } from "../../api's/booking/booking.query";
import { Search, MapPin, Calendar, Clock, User, ArrowRight, ShieldCheck, Users, Check, ChevronRight, X } from 'lucide-react';
import Map from '../../utils/Map';
import LocationAutocomplete from '../../utils/LocationAutocomplete';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const FindRide = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [searchParams, setSearchParams] = useState({
        date: '',
        time: '',
        seats: 1
    });

    useEffect(() => {
        if (location.state) {
            const { pickup: p, drop: d, date, time, seats } = location.state;
            if (p) setPickup(p);
            if (d) setDrop(d);
            setSearchParams(prev => ({
                ...prev,
                date: date || prev.date,
                time: time || prev.time,
                seats: seats || prev.seats
            }));
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state && pickup && drop) {
            refetch();
        }
    }, [pickup, drop]);

    const [mapRoutes, setMapRoutes] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [seatsRequested, setSeatsRequested] = useState(1);
    const [isVehiclePhotoOpen, setIsVehiclePhotoOpen] = useState(false);

    const { data: ridesData, isLoading, refetch } = useSearchRides(
        pickup?.name && drop?.name ? {
            from: pickup.name,
            to: drop.name,
            date: searchParams.date,
            seats: searchParams.seats
        } : null
    );

    const { mutate: createBooking, isLoading: isBooking } = useBookRide();

    // Fetch routes between pickup and drop
    const fetchRoutes = async () => {
        if (!pickup || !drop) return;

        try {
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_KEY}`
            );
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                setMapRoutes(data.routes);
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
        }
    };

    useEffect(() => {
        if (pickup && drop) {
            fetchRoutes();
        }
    }, [pickup, drop]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!pickup || !drop) {
            toast.error("Please enter both pickup and destination");
            return;
        }
        refetch();
    };

    const handleRideSelect = (ride) => {
        setSelectedRide(ride);
        if (ride.route && ride.route.coordinates) {
            // Map component expects { geometry: { type: "LineString", coordinates: [[lng, lat], ...] } }
            setMapRoutes([{
                geometry: {
                    type: "LineString",
                    coordinates: ride.route.coordinates
                },
                distance: 0,
                duration: 0
            }]);
        }
    };

    const handleConfirmBooking = () => {
        createBooking({
            rideId: selectedRide._id,
            seatsRequested
        }, {
            onSuccess: () => {
                toast.success("Booking request sent! 🚗");
                setIsBookingModalOpen(false);
                navigate('/myRides');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to create booking");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Find Your <span className="text-blue-600">Journey</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Smart rides, shared moments.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 items-start">
                    {/* Left Column: Map & Selected Ride Detail */}
                    <div className="lg:sticky lg:top-24 order-2 lg:order-1 flex flex-col gap-6">
                        {/* Map Container */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[400px] lg:h-[500px] relative">
                            <Map
                                pickup={pickup}
                                drop={drop}
                                routes={mapRoutes}
                                selectedRouteIndex={0}
                            />
                            {!selectedRide && (
                                <div className="absolute top-4 right-4 z-[1000]">
                                    <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Interactive Map</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Ride Detail Card (Moved Below Map) */}
                        {selectedRide && (
                            <div className="animate-in fade-in slide-in-from-top-5 duration-300">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                                {selectedRide.driverId?.profilePhoto ? (
                                                    <img src={selectedRide.driverId.profilePhoto} alt="Driver" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <User size={28} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 leading-tight">{selectedRide.driverId?.fullName || "Verified Driver"}</h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <ShieldCheck size={14} className="text-blue-600" />
                                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">Verified Provider</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedRide(null);
                                                if (pickup && drop) fetchRoutes();
                                            }}
                                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <Calendar size={12} className="text-gray-400" />
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Departure Date</p>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {new Date(selectedRide.departureTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Time</p>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {new Date(selectedRide.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setIsVehiclePhotoOpen(true)}
                                                className="w-full text-left bg-gray-50 p-3 rounded-lg border border-gray-100 transition-all hover:bg-gray-100 hover:border-blue-200 group/v"
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3 h-3 text-gray-400 group-hover/v:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover/v:text-blue-500">Vehicle Info</p>
                                                    </div>
                                                    <Search size={12} className="text-gray-300 group-hover/v:text-blue-400 opacity-0 group-hover/v:opacity-100 transition-opacity" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 truncate">{selectedRide.vehicle?.vehicleModel}</p>
                                                <p className="text-[10px] font-bold text-blue-600 font-mono tracking-widest mt-0.5 uppercase">{selectedRide.vehicle?.vehicleNumber}</p>
                                            </button>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <Users size={12} className="text-gray-400" />
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Capacity</p>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">{selectedRide.availableSeats} / {selectedRide.totalSeats || 4} Seats Available</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsBookingModalOpen(true)}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                                    >
                                        <span>Confirm Ride Booking</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                        <span className="text-lg">₹{selectedRide.pricePerSeat}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Search & Results */}
                    <div className="order-1 lg:order-2 space-y-8">
                        {/* Search Card */}
                        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 px-1">Pickup Location</label>
                                        <LocationAutocomplete
                                            placeholder="Where from?"
                                            onChange={setPickup}
                                            value={pickup?.name}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 px-1">Destination</label>
                                        <LocationAutocomplete
                                            placeholder="Where to?"
                                            onChange={setDrop}
                                            value={drop?.name}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 px-1">Date</label>
                                        <input
                                            type="date"
                                            value={searchParams.date}
                                            onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 px-1">Seats Need</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="6"
                                            value={searchParams.seats}
                                            onChange={(e) => setSearchParams({ ...searchParams, seats: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Search size={18} />
                                            <span>Find Available Rides</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Search Results */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Search Results</h3>
                                {ridesData?.count > 0 && (
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                                        {ridesData.count} Rides
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar lg:max-h-[calc(100vh-450px)]">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-40 bg-white border border-gray-100 animate-pulse rounded-xl" />
                                    ))
                                ) : !ridesData || ridesData?.data?.length === 0 ? (
                                    <div className="text-center py-12 px-6 bg-white border border-gray-200 rounded-xl">
                                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search size={24} className="text-gray-300" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">No rides found</h3>
                                        <p className="text-gray-500 text-sm mt-1 max-w-[280px] mx-auto">
                                            Try adjusting your search criteria or checking a different date.
                                        </p>
                                    </div>
                                ) : (
                                    ridesData.data.map((ride) => {
                                        const isSelected = selectedRide?._id === ride._id;
                                        return (
                                            <div
                                                key={ride._id}
                                                onClick={() => handleRideSelect(ride)}
                                                className={`group p-6 rounded-xl cursor-pointer transition-all border-2 ${isSelected
                                                    ? "bg-white border-blue-600 shadow-md"
                                                    : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                                                                <Clock size={12} className="text-gray-500" />
                                                                <span className="text-[10px] font-bold text-gray-700">
                                                                    {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                                                                <ShieldCheck size={12} className="text-blue-600" />
                                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Verified</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm font-bold text-gray-900">{ride.startLocation.name.split(',')[0]}</p>
                                                            <ArrowRight size={14} className="text-gray-300" />
                                                            <p className="text-sm font-bold text-gray-900">{ride.endLocation.name.split(',')[0]}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 w-fit">
                                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>
                                                            <span className="text-[10px] font-bold text-gray-600 truncate max-w-[120px]">{ride.vehicle?.vehicleModel}</span>
                                                            <span className="text-[10px] font-bold text-blue-600 font-mono tracking-wider">{ride.vehicle?.vehicleNumber}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Price</p>
                                                        <p className="text-2xl font-bold text-gray-900">₹{ride.pricePerSeat}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-6 pt-5 border-t border-gray-50">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                        {ride.driverId?.profilePhoto ? (
                                                            <img src={ride.driverId.profilePhoto} alt="Driver" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <User size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{ride.driverId?.fullName || "Verified Driver"}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Users size={12} className="text-gray-400" />
                                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
                                                                {ride.availableSeats} Seats Left
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-300 group-hover:bg-gray-100"}`}>
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && selectedRide && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsBookingModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-sm rounded-2xl p-6 md:p-8 shadow-2xl transition-all">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                <Users size={28} className="text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Select Seats</h2>
                            <p className="text-gray-500 text-sm mt-1">How many people are traveling?</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-8">
                                <button
                                    onClick={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
                                    className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 hover:text-gray-900 transition-all"
                                >
                                    -
                                </button>
                                <div className="text-4xl font-bold text-gray-900 w-10 text-center">
                                    {seatsRequested}
                                </div>
                                <button
                                    onClick={() => setSeatsRequested(Math.min(selectedRide.availableSeats, seatsRequested + 1))}
                                    className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 hover:text-gray-900 transition-all"
                                >
                                    +
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 border border-gray-100">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <span>Price per seat</span>
                                    <span className="text-gray-900 font-bold">₹{selectedRide.pricePerSeat}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                                    <span className="text-sm font-bold text-gray-900">Total Amount</span>
                                    <span className="text-xl font-bold text-blue-600">₹{selectedRide.pricePerSeat * seatsRequested}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isBooking}
                                    className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isBooking ? (
                                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            <span>Request Booking</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="w-full text-gray-400 py-2 rounded-lg font-bold text-sm hover:text-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle Photo Modal */}
            {isVehiclePhotoOpen && selectedRide?.vehicle?.vehicleImage && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsVehiclePhotoOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl">
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={() => setIsVehiclePhotoOpen(false)}
                                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <img
                            src={selectedRide.vehicle.vehicleImage}
                            alt={`${selectedRide.vehicle.vehicleModel} - Vehicle`}
                            className="w-full h-auto max-h-[80vh] object-contain bg-gray-900 mx-auto"
                        />
                        <div className="p-6 bg-white flex justify-between items-center border-t border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedRide.vehicle.vehicleModel}</h3>
                                <p className="text-sm font-mono font-bold text-blue-600 tracking-widest mt-1 uppercase">{selectedRide.vehicle.vehicleNumber}</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                <ShieldCheck size={16} className="text-blue-600" />
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Verified Vehicle</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}} />
        </div>
    );
};

export default FindRide;
