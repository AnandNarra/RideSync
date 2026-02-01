import React, { useState } from 'react';
import { useSubmitDriverRequest, useGetMyDriverStatus } from '../../api\'s/user/user.query';
import { useQueryClient } from '@tanstack/react-query';

const PublishRide = () => {

    const [licenseNumber, setLicenseNumber] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [numberPlate, setNumberPlate] = useState("")

    const { mutate: submitRequest, isPending } = useSubmitDriverRequest();
    const { data: statusData, isLoading: isLoadingStatus } = useGetMyDriverStatus();
    const queryClient = useQueryClient();

    const handleSumbit = (e) => {
        e.preventDefault();

        const payload = {
            licenseNumber,
            vehicleModel,
            numberPlate
        };

        submitRequest(payload, {
            onSuccess: () => {
                // Reset form
                setLicenseNumber("");
                setVehicleModel("");
                setNumberPlate("");

                // Refetch status
                queryClient.invalidateQueries({ queryKey: ["my-driver-status"] });
            }
        });
    }

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
                            type="text"
                            name="vehicleModel"
                            placeholder="Vehicle Model"
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />

                        <input
                            type="text"
                            name="numberPlate"
                            placeholder="Number Plate"
                            value={numberPlate}
                            onChange={(e) => setNumberPlate(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />

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
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-green-50 border-2 border-green-200 p-8 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Congratulations! 🎉</h2>
                        <p className="text-gray-700 mb-4">
                            The admin has approved your driver request.
                        </p>
                        <p className="text-gray-600 mb-6">
                            You can now publish your rides and start earning!
                        </p>
                        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                            Publish a Ride
                        </button>
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
