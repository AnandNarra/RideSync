import React, { useState } from 'react';

const PublishRide = () => {

    const [licenseNumber , setLicenseNumber] = useState("")
    const [vehicleNumber ,setVehicleNumber] = useState("")
    const [experience , setExperience] = useState("")

    const handleSumbit = () =>{

    }
    return (
        <>

            <div className="min-h-screen flex flex-col items-center ">
                <div className="  bg-white p-8 rounded-2xl shadow-xl">

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
                        />

                        <input
                            type="text"
                            name="vehicleNumber"
                            placeholder="Vehicle Number"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        <input
                            type="number"
                            name="experience"
                            placeholder="Experience (Years)"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Send Details
                        </button>
                    </form>
                </div>

            </div>
        </>
    );
};

export default PublishRide;
