'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import ListingCard from '@/components/ListingCard';
import SearchFilters from '@/components/SearchFilters';
import Map from '@/components/Map';  // Updated import

interface Listing {
  id: string; // Add this line
  title: string;
  propertyType: string;
  rentPrice: number;
  city: string;
  country: string;
  images: string[];
  userId: string;
  // Add other necessary properties, but remove 'id' if it's present
}

interface Filters {
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  location: string;
}

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const listingsRef = ref(database, 'listings');
    const snapshot = await get(listingsRef);
    if (snapshot.exists()) {
      const listingsData = snapshot.val();
      const listingsArray = Object.entries(listingsData).map(([key, data]) => ({
        ...(data as Listing),
        id: key, // Use the Firebase key as the id
      }));
      setListings(listingsArray);
      setFilteredListings(listingsArray);
    }
  };

  const handleFilterChange = (filters: Filters) => {
    const filtered = listings.filter((listing) => {
      const matchesMinPrice = !filters.minPrice || listing.rentPrice >= parseInt(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || listing.rentPrice <= parseInt(filters.maxPrice);
      const matchesPropertyType = !filters.propertyType || listing.propertyType.toLowerCase().includes(filters.propertyType.toLowerCase());
      const matchesLocation = !filters.location || 
        listing.city.toLowerCase().includes(filters.location.toLowerCase()) || 
        listing.country.toLowerCase().includes(filters.location.toLowerCase());

      return matchesMinPrice && matchesMaxPrice && matchesPropertyType && matchesLocation;
    });

    setFilteredListings(filtered);
  };

  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Homes</h1>
        <SearchFilters onFilter={handleFilterChange} />
        <div className="flex mt-6 space-x-4">
          <div className={`transition-all duration-300 ease-in-out ${isMapExpanded ? 'w-0 opacity-0' : 'w-1/2 opacity-100'}`}>
            <h2 className="text-2xl font-semibold mb-4">Available Listings</h2>
            <div className="grid grid-cols-1 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${isMapExpanded ? 'w-full' : 'w-1/2'}`}>
            <Map listings={filteredListings} />
          </div>
        </div>
        <button
          onClick={toggleMapExpansion}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {isMapExpanded ? 'Show Listings' : 'Expand Map'}
        </button>
      </main>
    </div>
  );
}