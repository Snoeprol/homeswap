'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  images: string[];
  propertyType: string;
  city: string;
  country: string;
  rentPrice: number;
}

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="border rounded-lg overflow-hidden shadow-lg">
        <Image
          src={listing.images[0] || '/placeholder-house.jpg'}
          alt={listing.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
          <p className="text-gray-600 mb-2">{listing.propertyType} in {listing.city}, {listing.country}</p>
          <p className="text-orange-600 font-bold">${listing.rentPrice}/month</p>
        </div>
      </div>
    </Link>
  );
}