'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import ListingCard from '@/components/ListingCard';
import SearchFilters from '@/components/SearchFilters';
import Map from '@/components/Map';
import { Switch } from "@/components/ui/switch"
import { HomeIcon, MapIcon, ListIcon } from 'lucide-react';
import { Filters } from '../../components/SearchFilters';

interface Listing {
  id: string;
  title: string;
  propertyType: string;
  rentPrice: number;
  city: string;
  country: string;
  images: string[];
  userId: string;
  description: string;
  latitude?: number;
  longitude?: number;
  availableFrom?: string;
  availableTo?: string;
}

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    location: '',
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    const listingsRef = ref(database, 'listings');
    try {
      const snapshot = await get(listingsRef);
      if (snapshot.exists()) {
        const listingsData = snapshot.val();
        const listingsArray = Object.entries(listingsData).map(([key, data]) => ({
          ...(data as Listing),
          id: key,
          title: (data as Listing).title.slice(0, 50) + ((data as Listing).title.length > 50 ? '...' : ''),
          description: (data as Listing).description?.slice(0, 200) + ((data as Listing).description?.length > 200 ? '...' : ''),
        }));
        setListings(listingsArray);
        setFilteredListings(listingsArray);
      } else {
        setListings([]);
        setFilteredListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // Apply filters to listings here
    const filtered = listings.filter(listing => {
      // Implement your filtering logic here
      // For example:
      const matchesMinPrice = !newFilters.minPrice || listing.rentPrice >= parseFloat(newFilters.minPrice);
      const matchesMaxPrice = !newFilters.maxPrice || listing.rentPrice <= parseFloat(newFilters.maxPrice);
      const matchesPropertyType = !newFilters.propertyType || listing.propertyType === newFilters.propertyType;
      const matchesLocation = !newFilters.location || listing.city.toLowerCase().includes(newFilters.location.toLowerCase());
      
      // Add date range filtering if needed

      return matchesMinPrice && matchesMaxPrice && matchesPropertyType && matchesLocation;
    });
    setFilteredListings(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center">
          <HomeIcon className="mr-2 h-8 w-8 text-orange-500" />
          Browse Homes
        </h1>
        <SearchFilters onFilter={handleFilterChange} />
        <div className="flex items-center justify-end mt-6 mb-4">
          <span className="mr-2 text-gray-700">Show Map</span>
          <Switch 
            checked={showMap} 
            onCheckedChange={setShowMap} 
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="mt-6">
            {showMap ? (
              <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
                <Map listings={filteredListings} />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
                  <ListIcon className="mr-2 h-6 w-6 text-orange-500" />
                  Available Listings
                </h2>
                {filteredListings.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600 text-lg">No listings found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                      <ListingCard 
                        key={listing.id} 
                        listing={{
                          ...listing,
                          rentPrice: listing.rentPrice * 0.91 // Convert USD to EUR (approximate conversion)
                        }} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}