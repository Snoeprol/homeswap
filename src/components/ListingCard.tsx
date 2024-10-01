'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HomeIcon, MapPinIcon, EuroIcon, BedDoubleIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    propertyType: string;
    rentPrice: number;
    city: string;
    country: string;
    images: string[];
    description: string;
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        <Image
          src={listing.images[0] || '/placeholder.svg'}
          alt={listing.title}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700 flex items-center">
          <HomeIcon className="w-3 h-3 mr-1 text-orange-500" />
          {listing.propertyType}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-1">{listing.title}</h3>
        <div className="flex items-center mb-2 text-gray-600">
          <MapPinIcon className="w-4 h-4 mr-1 text-orange-500" />
          <p>{listing.city}, {listing.country}</p>
        </div>
        <div className="flex items-center mb-2 text-gray-800 font-bold">
          <EuroIcon className="w-4 h-4 mr-1 text-orange-500" />
          <p>{listing.rentPrice.toFixed(2)} per month</p>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
        <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
          <Link href={`/listing/${listing.id}`}>
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
}