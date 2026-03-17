import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MapContext = createContext();

export const useMap = () => useContext(MapContext);

export const MapProvider = ({ children }) => {
  const [google, setGoogle] = useState(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const googleLoader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });



    googleLoader.load().then((g) => {

      setGoogle(g);
    }).catch(err => {
      console.error('Failed to load Google Maps API:', err);
      setError('Failed to load Google Maps API');
    });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setLoading(false);
        },
        (err) => {
          console.warn('Geolocation failed, using default location (New York):', err);
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported');
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
      setLoading(false);
    }
  }, []);

  const value = {
    google,
    map,
    setMap,
    userLocation,
    restaurants,
    setRestaurants,
    loading,
    error
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};
