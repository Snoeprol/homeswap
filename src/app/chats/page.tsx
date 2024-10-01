'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { HomeIcon, PlusCircleIcon, CalendarIcon } from "lucide-react";
import { auth, database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  availableFrom: number;
  availableTo: number;
  createdAt: number;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.push('/auth');
      return;
    }

    const userListingsRef = ref(database, `userListings/${user.uid}`);

    const handleListings = onValue(userListingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const listingsData = snapshot.val();
        const listingsArray = Object.entries(listingsData).map(([id, listing]) => ({
          id,
          ...(listing as Omit<Listing, 'id'>)
        }));
        setListings(listingsArray.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setListings([]);
      }
      setIsLoading(false);
    });

    return () => {
      off(userListingsRef, 'value', handleListings);
    };
  }, [router]);

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Your Listings</h1>
      {listings.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You have no active listings.</p>
          <Button asChild variant="outline" className="text-orange-500 hover:text-orange-600 border-orange-500 hover:border-orange-600">
            <Link href="/list-your-house" className="flex items-center justify-center">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create a Listing
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => (
            <li key={listing.id} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <Link href={`/listing/${listing.id}`} className="block">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-800">{listing.title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-gray-600">
                  <HomeIcon className="h-4 w-4 mr-2 text-orange-500" />
                  <p className="text-sm truncate">{listing.location}</p>
                </div>
                <div className="mt-2 flex items-center text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
                  <p className="text-sm">
                    {new Date(listing.availableFrom).toLocaleDateString()} - {new Date(listing.availableTo).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}