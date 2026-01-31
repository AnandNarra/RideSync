import { useEffect, useRef, useState } from "react";

const LocationAutocomplete = ({ placeholder, onChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const accessToken = import.meta.env.VITE_MAPBOX_KEY;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=5`
      );
      const data = await res.json();
      setResults(data.features || []);
    }, 500);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border px-2 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      />

      {results.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border rounded-lg shadow max-h-52 overflow-auto">
          {results.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                const shortName = item.place_name.split(',')[0]; // Get first part before comma
                onChange({
                  lat: item.center[1],
                  lng: item.center[0],
                  name: item.place_name,
                });
                setQuery(shortName); // Show shortened name in input
                setResults([]);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
            >
              {item.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
