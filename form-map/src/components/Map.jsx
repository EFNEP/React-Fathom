import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const MapComponent = () => {
  const navigate = useNavigate();

  const continentMarkers = [
    // Africa
    { lat: 9.082, lon: 8.6753, continent: 'Africa', city: 'Abuja, Nigeria' },
    // Asia
    { lat: 35.6895, lon: 139.6917, continent: 'Asia', city: 'Tokyo, Japan' },
    // Europe
    { lat: 48.8566, lon: 2.3522, continent: 'Europe', city: 'Paris, France' },
    // North America
    { lat: 40.7128, lon: -74.0060, continent: 'North America', city: 'New York, USA' },
    // South America
    { lat: -23.5505, lon: -46.6333, continent: 'South America', city: 'São Paulo, Brazil' },
    // Australia
    { lat: -33.8688, lon: 151.2093, continent: 'Australia', city: 'Sydney, Australia' },
    // Antarctica 
    { lat: -90.0, lon: 0.0, continent: 'Antarctica', city: 'South Pole' },
  ];

  return (
    <div style={{ height: '100vh' }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        style={{
          cursor: 'pointer',
          top: '20px', 
          left: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#0078a8', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          fontSize: '16px',
        }}
      >
        Back
      </button>
      
      <MapContainer center={[0, 0]} zoom={2} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {continentMarkers.map((point, index) => (
          <Marker 
            key={index} 
            position={[point.lat, point.lon]} 
            icon={L.divIcon({
              className: 'leaflet-div-icon',
              html: `<div style="background-color: #0078a8; padding: 10px; border-radius: 50%; color: white;  font-weight: bold;"></div>`, 
            })}
          >
            <Popup>
              <strong>{point.city}</strong><br />
              Continent: {point.continent}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
