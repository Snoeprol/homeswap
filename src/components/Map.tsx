'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface MapProps {
  listings: Listing[];
}

const Map: React.FC<MapProps> = ({ listings }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    if (!window.google) {
      window.initMap = initMap;
      loadGoogleMapsScript();
    } else {
      initMap();
    }

    return () => {
      if (map) {
        markers.forEach(marker => marker.setMap(null));
      }
    };
  }, []);

  useEffect(() => {
    if (map) {
      updateMarkers();
    }
  }, [listings, map]);

  const initMap = () => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
      });
      setMap(newMap);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const updateMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const bounds = new google.maps.LatLngBounds();
    const newMarkers: google.maps.Marker[] = [];

    listings.forEach(listing => {
      if (listing.latitude && listing.longitude) {
        const position = new google.maps.LatLng(listing.latitude, listing.longitude);
        const marker = new google.maps.Marker({
          position,
          map,
          title: listing.title,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="custom-info-window">
              <div class="info-window-content">
                <h3 class="info-window-title">${truncateText(listing.title, 30)}</h3>
                <button id="view-listing-${listing.id}" class="view-listing-btn">View Listing</button>
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        google.maps.event.addListener(infoWindow, 'domready', () => {
          const button = document.getElementById(`view-listing-${listing.id}`);
          if (button) {
            button.addEventListener('click', () => {
              window.open(`/listing/${listing.id}`, '_blank');
            });
          }
        });

        newMarkers.push(marker);
        bounds.extend(position);
      }
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      map?.fitBounds(bounds);
    }
  };

  return (
    <>
      <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
      <style jsx global>{`
        .custom-info-window {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 12px;
          max-width: 250px;
        }
        .info-window-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .info-window-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
          text-align: center;
        }
        .view-listing-btn {
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .view-listing-btn:hover {
          background-color: #2563eb;
        }
      `}</style>
    </>
  );
};

export default Map;