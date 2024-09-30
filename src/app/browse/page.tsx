'use client';

import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import SearchFilters from '@/components/SearchFilters';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { geocodeAddress } from '@/utils/geocode';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Custom house icon
const houseIcon = new L.DivIcon({
  html: '<div class="house-marker"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>',
  className: 'house-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

interface Listing {
  id: string;
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  rentPrice: number;
  city: string;
  country: string;
  address: string;
  images: string[];
  latitude: number | undefined;
  longitude: number | undefined;
}

const BrowseHomesPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.3676, 4.9041]); // Default to Amsterdam
  const [mapKey, setMapKey] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = ref(database, 'listings');
      const snapshot = await get(listingsRef);
      if (snapshot.exists()) {
        const listingsData = snapshot.val();
        const listingsArray = await Promise.all(
          Object.entries(listingsData).map(async ([id, data]) => {
            const listing = { id, ...(data as Omit<Listing, 'id'>) };
            if (!listing.latitude || !listing.longitude) {
              const fullAddress = `${listing.address}, ${listing.city}, ${listing.country}`;
              const coordinates = await geocodeAddress(fullAddress);
              if (coordinates) {
                const [latitude, longitude] = coordinates;
                await update(ref(database, `listings/${id}`), { latitude, longitude });
                return { ...listing, latitude, longitude };
              }
            }
            return listing;
          })
        );
        setListings(listingsArray);
        setFilteredListings(listingsArray);

        // Set initial map center to the first listing with valid coordinates or keep default
        const firstValidListing = listingsArray.find(listing => listing.latitude && listing.longitude);
        if (firstValidListing) {
          setMapCenter([firstValidListing.latitude!, firstValidListing.longitude!]);
        }
      }
    };

    fetchListings();
  }, []);

  const handleFilterChange = useCallback((filteredResults: Listing[]) => {
    setFilteredListings(filteredResults);
  }, []);

  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded);
    setMapKey(prevKey => prevKey + 1); // This will force the map to re-render
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Homes</h1>
        <SearchFilters listings={listings} onFilterChange={handleFilterChange} />
        <div className="flex mt-6 space-x-4">
          <div className={`transition-all duration-300 ease-in-out ${isMapExpanded ? 'w-0 overflow-hidden' : 'w-1/2'}`}>
            <h2 className="text-2xl font-semibold mb-4">Available Listings</h2>
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-20rem)]">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
                  <Image
                    src={listing.images[0] || '/placeholder.jpg'}
                    alt={listing.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                  <p className="text-gray-600 mb-2">{listing.city}, {listing.country}</p>
                  <p className="text-gray-600 mb-2">{listing.propertyType} • {listing.bedrooms} bed • {listing.bathrooms} bath</p>
                  <p className="text-lg font-bold mb-4">${listing.rentPrice}/month</p>
                  <Link href={`/listing/${listing.id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className={`relative transition-all duration-300 ease-in-out ${isMapExpanded ? 'w-full' : 'w-1/2'}`}>
            <MapContainer key={mapKey} center={mapCenter} zoom={13} style={{ height: 'calc(100vh - 12rem)', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredListings.filter(listing => listing.latitude && listing.longitude).map((listing) => (
                <Marker 
                  key={listing.id} 
                  position={[listing.latitude!, listing.longitude!]} 
                  icon={houseIcon}
                >
                  <Popup>
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p>{listing.city}, {listing.country}</p>
                      <p>${listing.rentPrice}/month</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <Button
              className="absolute bottom-4 left-4 z-[1000]"
              onClick={toggleMapExpansion}
            >
              {isMapExpanded ? <ArrowLeftIcon /> : <ArrowRightIcon />}
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">HouseSwap</h3>
              <p className="text-gray-400">Find your perfect home away from home.</p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
                <li><Link href="/browse" className="text-gray-400 hover:text-white">Browse Homes</Link></li>
                <li><Link href="/list-your-house" className="text-gray-400 hover:text-white">List Your House</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="text-gray-400">Email: info@houseswap.com</p>
              <p className="text-gray-400">Phone: +1 (123) 456-7890</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2023 HouseSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrowseHomesPage;