'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ListingCard({ listing }) {
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
          <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
          <p className="text-gray-600">{listing.city}, {listing.country}</p>
          <p className="text-lg font-bold mt-2">${listing.rentPrice}/month</p>
        </div>
      </div>
    </Link>
  );
}