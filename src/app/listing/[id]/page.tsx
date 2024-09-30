'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { database, auth } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, BedDouble, Bath, Square, Wifi, Tv, Car, Snowflake, Coffee, MessageCircle } from 'lucide-react';
import Chat from '@/components/Chat';

interface Listing {
  id: string;
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  totalArea: number;
  rentPrice: number;
  city: string;
  country: string;
  address: string;
  images: string[];
  description: string;
  amenities: string[];
  houseRules: string;
  isRentInclusive: boolean;
  userId: string;
}

interface User {
  displayName: string;
  photoURL: string;
  email: string;
}

export default function ListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchListingAndOwner = async () => {
      setIsLoading(true);
      try {
        const listingRef = ref(database, `listings/${id}`);
        const listingSnapshot = await get(listingRef);
        
        if (listingSnapshot.exists()) {
          const listingData = listingSnapshot.val();
          setListing({ id: listingSnapshot.key, ...listingData });
          
          // Fetch owner data
          const ownerRef = ref(database, `users/${listingData.userId}`);
          const ownerSnapshot = await get(ownerRef);
          
          if (ownerSnapshot.exists()) {
            const ownerData = ownerSnapshot.val();
            setOwner({
              displayName: ownerData.displayName || 'Unknown User',
              photoURL: ownerData.photoURL || '',
              email: ownerData.email || 'Email not available',
            });
          } else {
            console.error('Owner data not found');
            setOwner({
              displayName: 'Unknown User',
              photoURL: '',
              email: 'Email not available',
            });
          }
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListingAndOwner();
    }
  }, [id]);

  const handleChatClick = () => {
    if (currentUser) {
      if (currentUser.uid === listing?.userId) {
        // If the current user is the owner, show an alert
        alert("This is your own listing. You can't chat with yourself.");
      } else {
        // Navigate to chat page
        router.push(`/chat/${id}`);
      }
    } else {
      // Redirect to auth page
      router.push('/auth');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!listing) return <div>Listing not found</div>;

  const amenityIcons: { [key: string]: JSX.Element } = {
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'TV': <Tv className="h-4 w-4" />,
    'Free parking': <Car className="h-4 w-4" />,
    'Air conditioning': <Snowflake className="h-4 w-4" />,
    'Kitchen': <Coffee className="h-4 w-4" />,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{listing.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{listing.address}, {listing.city}, {listing.country}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {listing.images.map((image, index) => (
                <CarouselItem key={index}>
                  <Image src={image} alt={`Listing image ${index + 1}`} width={300} height={200} className="rounded-lg object-cover" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <BedDouble className="h-5 w-5 mr-2" />
              <span>{listing.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-5 w-5 mr-2" />
              <span>{listing.bathrooms} Bathrooms</span>
            </div>
            <div className="flex items-center">
              <Square className="h-5 w-5 mr-2" />
              <span>{listing.totalArea} m²</span>
            </div>
            <div>
              <Badge variant={listing.isRentInclusive ? "default" : "secondary"}>
                {listing.isRentInclusive ? "All-inclusive" : "Utilities not included"}
              </Badge>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p>{listing.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                  {amenityIcons[amenity] || null}
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          {listing.houseRules && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">House Rules</h3>
              <p>{listing.houseRules}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={owner?.photoURL} />
              <AvatarFallback>{owner?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{owner?.displayName}</p>
              <p className="text-sm text-gray-500">{owner?.email}</p>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">${listing.rentPrice}/month</p>
            <Button 
              className="mt-2 flex items-center" 
              onClick={handleChatClick}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Owner
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showChat && currentUser && currentUser.uid !== listing.userId && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Chat with Owner</h2>
          <Chat listingId={listing.id} ownerId={listing.userId} />
        </div>
      )}
    </div>
  );
}