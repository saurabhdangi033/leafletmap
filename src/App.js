// src/App.js
import React from 'react';
import './App.css';
import Map from './Map';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <div className="App">
      <h1>Leaflet Map</h1>
      <Map />
    </div>
  );
}

export default App;
