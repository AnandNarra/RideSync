import React, { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { getMyProfile } from '@/api\'s/user/user.api';
import { useSubmitDriverRequest, useGetMyDriverStatus } from '../../api\'s/user/user.query';
import { useQueryClient } from '@tanstack/react-query';
import Map from '../../utils/Map';
import LocationAutocomplete from '../../utils/LocationAutocomplete';
import "leaflet/dist/leaflet.css";
import { usePublishRide } from '@/api\'s/driver\'s/driver\'s.query';
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const PublishRide = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    // Driver Request states
    const [licenseNumber, setLicenseNumber] = useState("");
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [experience, setExperience] = useState("");
    const [licensePhoto, setLicensePhoto] = useState(null);
    const [aadhaarPhoto, setAadhaarPhoto] = useState(null);

    // Ride publishing states
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // New Vehicle states
    const [vehicleImage, setVehicleImage] = useState(null);
    const [vehiclePreview, setVehiclePreview] = useState(null);

    const [rideDetails, setRideDetails] = useState({
        date: "",
        time: "",
        seats: "",
        price: "",
        vehicleType: "Car",
        vehicleModel: "",
        vehicleNumber: ""
    });

    const { data: statusData, isLoading: isLoadingStatus } = useGetMyDriverStatus();
    const { mutate: submitRequest, isPending: isSubmittingDriver } = useSubmitDriverRequest();
    const { mutate: publishRideMutate, isPending: isPublishingRide } = usePublishRide();

    // Handle prefilled state from navigation (e.g., from Home page)
    useEffect(() => {
        if (location.state) {
            const { pickup: prefilledPickup, drop: prefilledDrop, date, seats } = location.state;
            if (prefilledPickup) setPickup(prefilledPickup);
            if (prefilledDrop) setDrop(prefilledDrop);
            if (date || seats) {
                setRideDetails(prev => ({
                    ...prev,
                    date: date || prev.date,
                    seats: seats || prev.seats
                }));
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Sync user role if driver status is approved
    useEffect(() => {
        if (statusData?.data?.status === 'approved' && user?.role === 'user') {
            const syncRole = async () => {
                try {
                    const profileData = await getMyProfile();
                    setUser(profileData.user);
                } catch (error) {
                    console.error("Failed to sync role:", error);
                }
            };
            syncRole();
        }
    }, [statusData, user, setUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVehicleImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setVehiclePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchRoutes = async () => {
        if (!pickup || !drop) return;
        setLoading(true);
        try {
            const accessToken = import.meta.env.VITE_MAPBOX_KEY;
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?alternatives=true&geometries=geojson&steps=true&access_token=${accessToken}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                setRoutes(data.routes);
                setSelectedRouteIndex(0);
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pickup && drop) {
            fetchRoutes();
        } else {
            setRoutes([]);
        }
    }, [pickup, drop]);

    const handleSubmitDriverRequest = (e) => {
        e.preventDefault();

        if (!licenseNumber || !aadhaarNumber || !experience || !licensePhoto || !aadhaarPhoto) {
            toast.warning("All driver details are required", {
                description: "Please provide your license and Aadhaar details, including photos.",
            });
            return;
        }

        const formData = new FormData();
        formData.append("licenseNumber", licenseNumber);
        formData.append("aadhaarNumber", aadhaarNumber);
        formData.append("experience", experience);
        if (licensePhoto) formData.append("licensePhoto", licensePhoto);
        if (aadhaarPhoto) formData.append("aadhaarPhoto", aadhaarPhoto);

        submitRequest(formData, {
            onSuccess: () => {
                setLicenseNumber("");
                setAadhaarNumber("");
                setExperience("");
                setLicensePhoto(null);
                setAadhaarPhoto(null);
                queryClient.invalidateQueries({ queryKey: ["my-driver-status"] });
                toast.success("Driver details submitted!");
            }
        });
    };

    const handlePublishRide = (e) => {
        e.preventDefault();
        if (!pickup || !drop || routes.length === 0) {
            toast.error("Please select pickup, drop and route");
            return;
        }

        if (!rideDetails.date || !rideDetails.time || !rideDetails.seats || !rideDetails.price || !rideDetails.vehicleModel || !rideDetails.vehicleNumber) {
            toast.warning("Missing ride details", {
                description: "Please fill in all vehicle and schedule details.",
            });
            return;
        }

        if (!vehicleImage) {
            toast.error("Please upload a vehicle photo");
            return;
        }

        const selectedRoute = routes[selectedRouteIndex];
        const departureTime = new Date(`${rideDetails.date}T${rideDetails.time}`).toISOString();

        const formData = new FormData();
        formData.append("vehicleImage", vehicleImage);
        formData.append("departureTime", departureTime);
        formData.append("availableSeats", rideDetails.seats);
        formData.append("pricePerSeat", rideDetails.price);
        formData.append("startLocation", JSON.stringify({ name: pickup.name, coordinates: [pickup.lng, pickup.lat] }));
        formData.append("endLocation", JSON.stringify({ name: drop.name, coordinates: [drop.lng, drop.lat] }));
        formData.append("route", JSON.stringify({ type: "LineString", coordinates: selectedRoute.geometry.coordinates }));
        formData.append("vehicle", JSON.stringify({
            vehicleType: rideDetails.vehicleType,
            vehicleModel: rideDetails.vehicleModel,
            vehicleNumber: rideDetails.vehicleNumber.toUpperCase()
        }));

        publishRideMutate(formData, {
            onSuccess: () => {
                toast.success("Ride published successfully 🚗");
                navigate("/publishedRides");
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to publish ride");
            }
        });
    };

    if (isLoadingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const driverStatus = statusData?.data?.status || 'none';

    if (driverStatus === 'none') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Become a Driver</h1>
                    <form onSubmit={handleSubmitDriverRequest} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                            <input
                                type="text"
                                placeholder="License Number"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhaar Number</label>
                            <input
                                type="number"
                                placeholder="12-digit Aadhaar"
                                value={aadhaarNumber}
                                onChange={(e) => setAadhaarNumber(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                            <input
                                type="number"
                                placeholder="Experience (e.g., 5)"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                min="0" max="45"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">License Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLicensePhoto(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhaar Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAadhaarPhoto(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmittingDriver}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isSubmittingDriver ? "Submitting..." : "Submit Application"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (driverStatus === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-amber-50 border-2 border-amber-200 p-8 rounded-3xl shadow-xl text-center">
                    <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-amber-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Application Pending</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Our team is currently reviewing your driver credentials. This usually takes 24-48 hours.
                    </p>
                    <div className="p-4 bg-white/50 rounded-2xl border border-amber-100">
                        <p className="text-sm text-amber-800 font-medium">Sit tight! We'll notify you once it's approved.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (driverStatus === 'approved') {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Publish a Ride</h1>
                        <p className="text-gray-500 mt-1">Fill in the details below to share your journey.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10 items-start">
                        {/* Map Section - Sticky on Desktop */}
                        <div className="lg:sticky lg:top-24 order-2 lg:order-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[400px] lg:h-[calc(100vh-160px)] relative">
                                <Map
                                    pickup={pickup}
                                    drop={drop}
                                    routes={routes}
                                    selectedRouteIndex={selectedRouteIndex}
                                    onRouteSelect={setSelectedRouteIndex}
                                />
                                {loading && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 transition-all">
                                        <div className="bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 border border-gray-100">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600/20 border-t-blue-600"></div>
                                            <span className="font-medium text-gray-700 text-sm">Calculating routes...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="order-1 lg:order-2 space-y-6">
                            <form onSubmit={handlePublishRide} className="space-y-6">
                                {/* Section 1: Vehicle Details */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                                        </svg>
                                        Vehicle Information
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Photo</label>
                                            <div className={`border-2 border-dashed rounded-lg p-4 transition-all ${vehiclePreview ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200 hover:border-blue-300'}`}>
                                                {vehiclePreview ? (
                                                    <div className="relative rounded-lg overflow-hidden group">
                                                        <img src={vehiclePreview} alt="Vehicle preview" className="w-full h-48 object-cover" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => { setVehicleImage(null); setVehiclePreview(null); }}
                                                                className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <label className="cursor-pointer">
                                                            <span className="text-blue-600 font-semibold hover:text-blue-700">Upload Photo</span>
                                                            <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                                        </label>
                                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                            <select
                                                value={rideDetails.vehicleType}
                                                onChange={(e) => setRideDetails({ ...rideDetails, vehicleType: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                            >
                                                <option value="Car">Car</option>
                                                <option value="Bike">Bike</option>
                                                <option value="SUV">SUV</option>
                                                <option value="Luxury">Luxury</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Honda Civic"
                                                value={rideDetails.vehicleModel}
                                                onChange={(e) => setRideDetails({ ...rideDetails, vehicleModel: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                                            <input
                                                type="text"
                                                placeholder="ABC-1234"
                                                value={rideDetails.vehicleNumber}
                                                onChange={(e) => setRideDetails({ ...rideDetails, vehicleNumber: e.target.value.toUpperCase() })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono tracking-wider"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Route */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Route Selection
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                                                <LocationAutocomplete
                                                    placeholder="Starting point..."
                                                    onChange={setPickup}
                                                    value={pickup?.name}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                                                <LocationAutocomplete
                                                    placeholder="Destination..."
                                                    onChange={setDrop}
                                                    value={drop?.name}
                                                />
                                            </div>
                                        </div>

                                        {routes.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Choose Path</label>
                                                {routes.map((route, index) => {
                                                    const duration = Math.round(route.duration / 60);
                                                    const distance = (route.distance / 1000).toFixed(1);
                                                    const isSelected = selectedRouteIndex === index;
                                                    return (
                                                        <div
                                                            key={index}
                                                            onClick={() => setSelectedRouteIndex(index)}
                                                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                                    {index + 1}
                                                                </span>
                                                                <span className="text-sm font-medium text-gray-700">{distance} km • {duration} mins</span>
                                                            </div>
                                                            {isSelected && <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Schedule */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Schedule & Price
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                            <input
                                                type="date"
                                                value={rideDetails.date}
                                                onChange={(e) => setRideDetails({ ...rideDetails, date: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                            <input
                                                type="time"
                                                value={rideDetails.time}
                                                onChange={(e) => setRideDetails({ ...rideDetails, time: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Seats Available</label>
                                            <input
                                                type="number"
                                                min="1" max="6"
                                                value={rideDetails.seats}
                                                onChange={(e) => setRideDetails({ ...rideDetails, seats: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Price per Seat (₹)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={rideDetails.price}
                                                onChange={(e) => setRideDetails({ ...rideDetails, price: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Summary Bar */}
                                    {routes.length > 0 && rideDetails.price && rideDetails.seats && (
                                        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Est. Earnings</p>
                                                <p className="text-xl font-bold text-gray-900">₹{rideDetails.price * rideDetails.seats}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Distance</p>
                                                <p className="text-sm font-semibold text-gray-700">{(routes[selectedRouteIndex].distance / 1000).toFixed(1)} km</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isPublishingRide}
                                        className="w-full mt-8 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {isPublishingRide ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Publishing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm & Publish Now</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (driverStatus === 'rejected') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-red-50 border-2 border-red-200 p-8 rounded-[2rem] shadow-xl text-center">
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Request Rejected</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Unfortunately, your driver credentials couldn't be verified at this time.
                    </p>
                    {statusData?.data?.rejectedReason && (
                        <div className="bg-white border border-red-200 rounded-2xl p-5 mb-8 text-left">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Admin Feedback</p>
                            <p className="text-sm font-bold text-red-700 leading-relaxed italic">"{statusData.data.rejectedReason}"</p>
                        </div>
                    )}
                    <button
                        onClick={() => queryClient.setQueryData(["my-driver-status", user?._id], { data: { status: 'none' } })}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default PublishRide;
