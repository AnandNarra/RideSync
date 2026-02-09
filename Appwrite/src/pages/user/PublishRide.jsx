import React, { useState, useEffect } from 'react';
import { useSubmitDriverRequest, useGetMyDriverStatus } from '../../api\'s/user/user.query';
import { useQueryClient } from '@tanstack/react-query';
import Map from '../../utils/Map';
import LocationAutocomplete from '../../utils/LocationAutocomplete';
import "leaflet/dist/leaflet.css";

const PublishRide = () => {

    const [licenseNumber, setLicenseNumber] = useState("")
    const [aadhaarNumber, setAadhaarNumber] = useState("")
    const [experience, setExperience] = useState("")
    const [licensePhoto, setLicensePhoto] = useState(null)
    const [aadhaarPhoto, setAadhaarPhoto] = useState(null)

    // Ride publishing states
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const [rideDetails, setRideDetails] = useState({
        date: "",
        time: "",
        seats: "",
        price: ""
    });

    const { mutate: submitRequest, isPending } = useSubmitDriverRequest();
    const { data: statusData, isLoading: isLoadingStatus } = useGetMyDriverStatus();
    const queryClient = useQueryClient();

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

    const handleSumbit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("licenseNumber", licenseNumber);
        formData.append("aadhaarNumber", aadhaarNumber);
        formData.append("experience", experience);
        if (licensePhoto) formData.append("licensePhoto", licensePhoto);
        if (aadhaarPhoto) formData.append("aadhaarPhoto", aadhaarPhoto);

        // Debug: Log FormData contents
        console.group("Driver Request Debug Data");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        console.groupEnd();

        submitRequest(formData, {
            onSuccess: () => {
                // Reset form
                setLicenseNumber("");
                setAadhaarNumber("");
                setExperience("");
                setLicensePhoto(null);
                setAadhaarPhoto(null);

                // Refetch status
                queryClient.invalidateQueries({ queryKey: ["my-driver-status"] });
            }
        });
    }

    const handlePublishRide = (e) => {
        e.preventDefault();

        if (!pickup || !drop || !rideDetails.date || !rideDetails.time || !rideDetails.seats || !rideDetails.price) {
            alert("Please fill all fields");
            return;
        }

        const rideData = {
            pickup,
            drop,
            route: routes[selectedRouteIndex],
            ...rideDetails
        };

        console.log("Publishing ride:", rideData);
        // TODO: Call API to publish ride
    };

    if (isLoadingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">PublishRide Loading...</p>
                </div>
            </div>
        );
    }

    // If there's an error fetching status (like 404), default to 'none' to show the form
    const driverStatus = statusData?.data?.status || 'none';

    // Show status messages based on driver request status
    if (driverStatus === 'none') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Driver Details
                    </h1>

                    <form onSubmit={handleSumbit} className="space-y-4">
                        <input
                            type="text"
                            name="licenseNumber"
                            placeholder="License Number"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />

                        <input
                            type="number"
                            name="aadhaarNumber"
                            placeholder="Aadhaar Number"
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />

                        <input
                            type="number"
                            name="experience"
                            placeholder="Experience (in years)"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            min="0"
                            max="40"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">License Photo</label>
                            <input
                                type="file"
                                name="licensePhoto"
                                accept="image/*"
                                onChange={(e) => setLicensePhoto(e.target.files[0])}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Aadhaar Photo</label>
                            <input
                                type="file"
                                name="aadhaarPhoto"
                                accept="image/*"
                                onChange={(e) => setAadhaarPhoto(e.target.files[0])}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Submitting..." : "Send Details"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (driverStatus === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-yellow-50 border-2 border-yellow-200 p-8 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Request Pending</h2>
                        <p className="text-gray-700 mb-2">
                            Your driver request is currently under review.
                        </p>
                        <p className="text-gray-600 text-sm">
                            The admin will review your profile and get back to you soon.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (driverStatus === 'approved') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Publish a Ride</h1>
                        <p className="text-gray-600 mt-2">Share your journey and earn money!</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Map Section */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] relative z-0">
                            <Map
                                pickup={pickup}
                                drop={drop}
                                routes={routes}
                                selectedRouteIndex={selectedRouteIndex}
                                onRouteSelect={setSelectedRouteIndex}
                            />
                        </div>

                        {/* Form Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Ride Details</h2>

                            <form onSubmit={handlePublishRide} className="space-y-4">
                                {/* Location Inputs */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Pickup Location
                                    </label>
                                    <LocationAutocomplete
                                        placeholder="Enter pickup location"
                                        onChange={setPickup}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Drop Location
                                    </label>
                                    <LocationAutocomplete
                                        placeholder="Enter drop location"
                                        onChange={setDrop}
                                    />
                                </div>

                                {/* Route Selection */}
                                {routes.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Select Route
                                        </label>
                                        <select
                                            value={selectedRouteIndex}
                                            onChange={(e) => setSelectedRouteIndex(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {routes.map((route, index) => {
                                                const durationMinutes = Math.round(route.duration / 60);
                                                const distanceKm = (route.distance / 1000).toFixed(1);
                                                const hours = Math.floor(durationMinutes / 60);
                                                const minutes = durationMinutes % 60;
                                                const timeText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

                                                return (
                                                    <option key={index} value={index}>
                                                        Route {index + 1}: {timeText} - {distanceKm} km
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}

                                {/* Date and Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={rideDetails.date}
                                            onChange={(e) => setRideDetails({ ...rideDetails, date: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            value={rideDetails.time}
                                            onChange={(e) => setRideDetails({ ...rideDetails, time: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Seats and Price */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Available Seats
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="8"
                                            value={rideDetails.seats}
                                            onChange={(e) => setRideDetails({ ...rideDetails, seats: e.target.value })}
                                            placeholder="e.g., 3"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Price per Seat (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={rideDetails.price}
                                            onChange={(e) => setRideDetails({ ...rideDetails, price: e.target.value })}
                                            placeholder="e.g., 200"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Route Info Display */}
                                {routes.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Route Summary</h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><strong>Distance:</strong> {(routes[selectedRouteIndex].distance / 1000).toFixed(1)} km</p>
                                            <p><strong>Duration:</strong> {Math.round(routes[selectedRouteIndex].duration / 60)} minutes</p>
                                            {rideDetails.price && rideDetails.seats && (
                                                <p className="text-green-600 font-semibold mt-2">
                                                    Total Earnings: ₹{rideDetails.price * rideDetails.seats}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Loading..." : "Publish Ride"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (driverStatus === 'rejected') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-red-50 border-2 border-red-200 p-8 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Request Rejected</h2>
                        <p className="text-gray-700 mb-4">
                            Unfortunately, your driver request has been rejected by the admin.
                        </p>

                        {statusData?.data?.rejectedReason && (
                            <div className="bg-white border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Rejection Reason:</p>
                                <p className="text-sm text-gray-600">{statusData.data.rejectedReason}</p>
                            </div>
                        )}

                        <p className="text-gray-600 mb-6">
                            You can reapply with updated information.
                        </p>
                        <button
                            onClick={() => queryClient.setQueryData(["my-driver-status"], { data: { status: 'none' } })}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            Reapply Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default PublishRide;
