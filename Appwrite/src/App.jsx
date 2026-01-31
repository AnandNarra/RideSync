import { useState } from "react";
import "./App.css";

import LocationAutocomplete from "./utils/LocationAutocomplete";
import Map from "./utils/Map";

import "leaflet/dist/leaflet.css";
import Navbar from "./Components/Navbar";



function App() {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);

  const [ride, setRide] = useState({
    date: "",
    time: "",
    seats: "",
  });

  function handlePublishRide(e) {
    e.preventDefault();
    console.log("Publishing ride:", { pickup, drop, ride });
  }

  function handdleShowRoute() {
    console.log("Show route clicked");
    // your route logic here
  }

  return (
    <>

    <Navbar/>
 
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Share rides.
              <br />
              Save money.
              <br />
              Travel together.
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              RideSync connects drivers with empty seats to passengers going the
              same way. Affordable, social, and eco-friendly travel.
            </p>

            <div className="mt-8 flex gap-4">
              <button className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg">
                Find a Ride
              </button>
              <button className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:border-blue-600 hover:text-blue-600">
                Publish a Ride
              </button>
            </div>
          </div>

          {/* RIGHT MAP + FORM */}
          {/* RIGHT MAP + FORM */}
          <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-xl">

            {/* MAP */}
            <div className="absolute inset-0 z-0">
              <Map pickup={pickup} drop={drop} route={route} />
            </div>

            {/* FLOATING FORM */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-white p-5 rounded-2xl shadow-xl z-20">
              <form className="space-y-4" onSubmit={handlePublishRide}>

                <LocationAutocomplete placeholder="Pickup" onChange={setPickup} />
                <LocationAutocomplete placeholder="Drop" onChange={setDrop} />

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="date"
                    className="border p-2 rounded"
                    onChange={(e) => setRide({ ...ride, date: e.target.value })}
                  />
                  <input
                    type="time"
                    className="border p-2 rounded"
                    onChange={(e) => setRide({ ...ride, time: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Seats"
                    className="border p-2 rounded"
                    onChange={(e) => setRide({ ...ride, seats: e.target.value })}
                  />
                </div>

                <button
                  
                  className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                >
                  Search A Ride
                </button>

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">10k+</p>
            <p className="text-sm text-gray-600">Happy Travelers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">Verified</p>
            <p className="text-sm text-gray-600">Drivers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">Secure</p>
            <p className="text-sm text-gray-600">Payments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">24/7</p>
            <p className="text-sm text-gray-600">Support</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            How RideSync Works
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold">Search a Ride</h3>
              <p className="mt-3 text-gray-600 text-sm">
                Enter your route and find available rides instantly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold">Book or Publish</h3>
              <p className="mt-3 text-gray-600 text-sm">
                Join a ride or publish one if you’re driving.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold">Travel Together</h3>
              <p className="mt-3 text-gray-600 text-sm">
                Meet, travel safely, and split costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white">
          Ready to start your journey?
        </h2>
        <p className="mt-4 text-blue-100">
          Find or publish a ride in minutes.
        </p>
        <div className="mt-6">
          <button className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold shadow-md hover:bg-gray-100">
            Get Started
          </button>
        </div>
      </section>



      
    </>
  );
}

export default App;
