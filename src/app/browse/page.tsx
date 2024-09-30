'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import ListingCard from '@/components/ListingCard';
import SearchFilters from '@/components/SearchFilters';

export default function BrowsePage() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = ref(database, 'listings');
      const snapshot = await get(listingsRef);
      if (snapshot.exists()) {
        const listingsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        setListings(listingsData);
        setFilteredListings(listingsData);
      }
    };

    fetchListings();
  }, []);

  const handleFilter = () => {
    // Implement filtering logic here
    // For now, we'll just set it to all listings
    setFilteredListings(listings);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Listings</h1>
      <SearchFilters onFilter={handleFilter} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}