import React, { useEffect, useRef } from 'react';
import { useMap } from '../context/MapContext';
import './MapContainer.css';

const MapContainer = () => {
  const mapRef = useRef(null);
  const { google, userLocation, map, setMap, restaurants } = useMap();
  const markersRef = useRef([]);

  useEffect(() => {
    if (google && userLocation && mapRef.current) {
        const newMap = new google.maps.Map(mapRef.current, {
            center: userLocation,
            zoom: 14,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "geometry.fill",
                    "stylers": [{ "weight": "2.00" }]
                },
                {
                    "featureType": "all",
                    "elementType": "geometry.stroke",
                    "stylers": [{ "color": "#9c9c9c" }]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text",
                    "stylers": [{ "visibility": "on" }]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{ "color": "#f2f2f2" }]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry.fill",
                    "stylers": [{ "color": "#ffffff" }]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry.stroke",
                    "stylers": [{ "color": "#ff4d4d" }, { "weight": "0.25" }]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry.fill",
                    "stylers": [{ "color": "#ffffff" }]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry.stroke",
                    "stylers": [{ "color": "#ff4d4d" }, { "weight": "0.25" }]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [{ "color": "#eeeeee" }]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#7b7b7b" }]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.stroke",
                    "stylers": [{ "color": "#ffffff" }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [{ "visibility": "simplified" }]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [{ "color": "#c8d7d4" }]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#070707" }]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.stroke",
                    "stylers": [{ "color": "#ffffff" }]
                }
            ],
            disableDefaultUI: true,
            zoomControl: true,
        });

        // Add user marker
        new google.maps.Marker({
            position: userLocation,
            map: newMap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4d79ff',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: 'white',
            },
            title: 'Your Location'
        });

        setMap(newMap);
    }
  }, [google, userLocation]);

  useEffect(() => {
    if (!google || !map) return;



    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (restaurants.length > 0) {
        // Add new markers
        restaurants.forEach(rest => {
            const location = rest.geometry?.location || rest.location;
            if (!location) {
                console.warn('Restaurant missing location:', rest.name || rest.displayName);
                return;
            }

            const marker = new google.maps.Marker({
                position: location,
                map: map,
                title: rest.name || rest.displayName,
                animation: google.maps.Animation.DROP
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 10px; max-width: 200px; color: #333;">
                  <h4 style="margin: 0 0 5px 0;">${rest.name || rest.displayName}</h4>
                  <p style="margin: 0 0 5px 0; font-size: 12px;">${rest.vicinity || rest.formattedAddress}</p>
                  <div style="color: #ffb400; font-weight: bold;">${rest.rating || 'N/A'} ⭐</div>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
        });

    }
  }, [google, map, restaurants]);

  return <div ref={mapRef} className="map-container" />;
};

export default MapContainer;
