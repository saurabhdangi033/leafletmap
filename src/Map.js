// src/Map.js
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import './Map.css';

// Fix for Leaflet marker icons not displaying correctly in React apps
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = () => {
  const [position, setPosition] = useState([51.505, -0.09]); // Default coordinates (London)
  const [location, setLocation] = useState(''); // For location search
  const [lat, setLat] = useState(51.505); // Latitude state
  const [lng, setLng] = useState(-0.09); // Longitude state
  const mapRef = useRef(); // Ref to access map instance

  // Custom function to smoothly change the map center
  const ChangeMapView = ({ coords }) => {
    const map = useMap();
    map.setView(coords, 13, { animate: true });
    return null;
  };

  // Function to handle location search input change
  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };

  // Function to handle coordinate input changes
  const handleLatChange = (e) => {
    setLat(parseFloat(e.target.value));
  };
  const handleLngChange = (e) => {
    setLng(parseFloat(e.target.value));
  };

  // Function to search for location using OpenStreetMap's Nominatim API
  const handleSearch = () => {
    if (location) {
      axios
        .get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const { lat, lon } = res.data[0];
            const newCoords = [parseFloat(lat), parseFloat(lon)];
            setPosition(newCoords);
            setLat(parseFloat(lat));
            setLng(parseFloat(lon));
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

  // Function to update the position based on entered latitude and longitude
  const handleCoordinatesSubmit = () => {
    setPosition([lat, lng]);
  };

  return (
    <div className="map-container">
      <div className="input-container">
        <input
          type="text"
          value={location}
          onChange={handleInputChange}
          placeholder="Search location"
          className="input-field"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      <div className="coordinate-container">
        <input
          type="number"
          value={lat}
          onChange={handleLatChange}
          placeholder="Latitude"
          className="input-field"
        />
        <input
          type="number"
          value={lng}
          onChange={handleLngChange}
          placeholder="Longitude"
          className="input-field"
        />
        <button onClick={handleCoordinatesSubmit} className="submit-button">
          Go to Coordinates
        </button>
      </div>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        ref={mapRef}
      >
        <ChangeMapView coords={position} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            Location: {lat}, {lng}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
