import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom green marker for pickup
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom red marker for drop
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Recenter({ position }) {
  const map = useMap();
  if (position) map.setView(position, 12);
  return null;
}

function FitBounds({ routes, selectedRouteIndex, pickup, drop }) {
  const map = useMap();

  useEffect(() => {
    // If routes are available, fit to the selected route
    if (routes && routes.length > 0 && routes[selectedRouteIndex]) {
      const selectedRoute = routes[selectedRouteIndex];
      const coordinates = selectedRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);

      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    // If no routes but both pickup and drop are set, fit to show both markers
    else if (pickup && drop) {
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [drop.lat, drop.lng]
      ]);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
    // If only pickup is set, center on pickup
    else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 12);
    }
  }, [routes, selectedRouteIndex, pickup, drop, map]);

  return null;
}

const Map = ({ pickup, drop, routes = [], selectedRouteIndex = 0, onRouteSelect }) => {
  const center = pickup
    ? [pickup.lat, pickup.lng]
    : [17.3617, 78.4752];

  return (
    <MapContainer center={center} zoom={10} className="w-full h-full">
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_KEY}`}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
      />


      <FitBounds routes={routes} selectedRouteIndex={selectedRouteIndex} pickup={pickup} drop={drop} />

      {/* Green marker for pickup */}
      {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={greenIcon} />}

      {/* Red marker for drop */}
      {drop && <Marker position={[drop.lat, drop.lng]} icon={redIcon} />}

      {/* Render all routes with click handlers */}
      {routes.map((route, index) => {
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const isSelected = index === selectedRouteIndex;

        return (
          <Polyline
            key={index}
            positions={coordinates}
            pathOptions={{
              color: isSelected ? '#3B82F6' : '#9CA3AF',
              weight: isSelected ? 5 : 3,
              opacity: isSelected ? 1 : 0.5,
            }}
            eventHandlers={{
              click: () => {
                if (onRouteSelect) {
                  onRouteSelect(index);
                }
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
};

export default Map;
