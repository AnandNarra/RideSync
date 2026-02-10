import { useGetMyRides } from "@/api's/driver's/driver's.query";
import React from "react";


const MyRides = () => {
  const { data, isLoading } = useGetMyRides();

  if (isLoading) {
    return <p className="text-center mt-10">Loading rides...</p>;
  }

  if (!data?.data?.length) {
    return (
      <div className="text-center mt-10 text-gray-600">
        You haven’t published any rides yet 🚗
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">My Rides</h1>

      {data.data.map((ride) => (
        <div
          key={ride._id}
          className="border rounded-xl p-4 bg-white shadow"
        >
          <div className="flex justify-between">
            <div>
              <p><b>From:</b> {ride.startLocation.name}</p>
              <p><b>To:</b> {ride.endLocation.name}</p>
              <p><b>Date:</b> {new Date(ride.departureTime).toLocaleString()}</p>
            </div>

            <div className="text-right">
              <p>Seats: {ride.availableSeats}</p>
              <p>₹ {ride.pricePerSeat} / seat</p>
              <span className="text-sm px-2 py-1 bg-blue-100 rounded">
                {ride.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyRides;
