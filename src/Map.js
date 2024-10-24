// src/Map.js
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet-routing-machine';
import './Map.css';

// Fix for Leaflet marker icons not displaying correctly in React apps
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = () => {
  const [startLocation, setStartLocation] = useState(''); // Start location state
  const [destinationLocation, setDestinationLocation] = useState(''); // Destination location state
  const [startCoords, setStartCoords] = useState([51.505, -0.09]); // Default start coordinates
  const [destCoords, setDestCoords] = useState([51.505, -0.09]); // Default destination coordinates
  const mapRef = useRef(); // Ref to access map instance
  const routingRef = useRef(null); // Ref to keep track of the routing instance

  const ChangeMapView = ({ coords }) => {
    const map = useMap();
    map.setView(coords, 13, { animate: true });
    return null;
  };

  const handleInputChange = (e, setLocation) => {
    setLocation(e.target.value);
  };

  const handleSearch = (type) => {
    const location = type === 'start' ? startLocation : destinationLocation;
    if (location) {
      axios
        .get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const { lat, lon } = res.data[0];
            const newCoords = [parseFloat(lat), parseFloat(lon)];
            if (type === 'start') {
              setStartCoords(newCoords);
            } else {
              setDestCoords(newCoords);
            }
          } else {
            alert('Location not found');
          }
        })
        .catch((err) => {
          console.error(err);
          alert('Error fetching location');
        });
    }
  };

  const handleRoute = () => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous route if exists
    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

    // Add new route using Leaflet Routing Machine
    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(startCoords[0], startCoords[1]),
        L.latLng(destCoords[0], destCoords[1]),
      ],
      lineOptions: {
        styles: [{ color: 'blue', weight: 5 }],
      },
      show: true,
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: (i, waypoint) => {
        return L.marker(waypoint.latLng);
      },
    }).addTo(map);
  };

  const handleSwap = () => {
    setStartLocation(destinationLocation);
    setDestinationLocation(startLocation);
    setStartCoords(destCoords);
    setDestCoords(startCoords);
  };

  return (
    <div className="map-container">
      <div className="input-container">
        <input
          type="text"
          value={startLocation}
          onChange={(e) => handleInputChange(e, setStartLocation)}
          placeholder="Start Location"
          className="input-field"
        />
      <button onClick={() => handleSearch('start')} className="button bounce">
  Search Start
</button>
<button onClick={handleSwap} className="button swap-button bounce">
  ↔
</button>
        <input
          type="text"
          value={destinationLocation}
          onChange={(e) => handleInputChange(e, setDestinationLocation)}
          placeholder="Destination Location"
          className="input-field"
        />
       <button onClick={() => handleSearch('destination')} className="button bounce">
  Search Destination
</button>
<button onClick={handleRoute} className="button bounce">
  Calculate Route
</button>
      </div>

      <MapContainer
        center={startCoords}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        ref={mapRef}
      >
        <ChangeMapView coords={startCoords} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={startCoords}>
          <Popup>Start: {startLocation}</Popup>
        </Marker>
        <Marker position={destCoords}>
          <Popup>Destination: {destinationLocation}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
