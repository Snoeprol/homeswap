'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface Listing {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  images: string[];
}

interface MapProps {
  listings: Listing[];
}

export default function Map({ listings }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
      version: "weekly",
    });

    loader.load().then(() => {
      if (mapRef.current && !map) {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#f5f5f5" }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#e9e9e9" }]
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9e9e9e" }]
            }
          ]
        });
        setMap(newMap);
      }
    });
  }, [map]);

  useEffect(() => {
    if (map) {
      updateMarkers();
    }
  }, [listings, map]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const updateMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers: google.maps.Marker[] = [];

    listings.forEach(listing => {
      if (listing.latitude && listing.longitude) {
        const position = new window.google.maps.LatLng(listing.latitude, listing.longitude);
        
        const markerIcon = {
          path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 7 13s7-7.75 7-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
          scale: 1.5,
          anchor: new google.maps.Point(12, 24),
        };

        const marker = new window.google.maps.Marker({
          position,
          map,
          icon: markerIcon,
          title: listing.title,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="bg-white rounded-lg shadow-md p-4 max-w-xs">
              <img src="${listing.images[0] || '/placeholder.svg'}" alt="${listing.title}" class="w-full h-32 object-cover rounded-md mb-2">
              <h3 class="text-lg font-semibold mb-2 text-gray-800">${truncateText(listing.title, 30)}</h3>
              <button id="view-listing-${listing.id}" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4 rounded hover:from-orange-600 hover:to-amber-600 transition-colors">
                View Listing
              </button>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        window.google.maps.event.addListener(infoWindow, 'domready', () => {
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
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-md">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}