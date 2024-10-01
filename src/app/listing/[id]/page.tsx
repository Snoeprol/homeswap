'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { database, auth } from '@/lib/firebase';
import { ref, onValue, off, remove, get, set, push, serverTimestamp } from 'firebase/database';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, BedDouble, Bath, Square, Wifi, Tv, Car, Snowflake, Coffee, MessageCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

const amenityIcons: { [key: string]: JSX.Element } = {
  "Wi-Fi": <Wifi className="h-4 w-4" />,
  "TV": <Tv className="h-4 w-4" />,
  "Parking": <Car className="h-4 w-4" />,
  "Air Conditioning": <Snowflake className="h-4 w-4" />,
  "Coffee Maker": <Coffee className="h-4 w-4" />,
};

export default function ListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const listingRef = ref(database, `listings/${id}`);

    const listingListener = onValue(listingRef, (snapshot) => {
      if (snapshot.exists()) {
        const listingData = snapshot.val();
        setListing({ id: snapshot.key!, ...listingData });

        // Fetch owner data
        const ownerListener = onValue(ref(database, `users/${listingData.userId}`), (ownerSnapshot) => {
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
          setIsLoading(false);
        });

        return () => {
          off(ref(database, `users/${listingData.userId}`), 'value', ownerListener);
        };
      } else {
        setError('Listing not found');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing');
      setIsLoading(false);
    });

    return () => {
      off(listingRef, 'value', listingListener);
    };
  }, [id]);

  const handleChatClick = async () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    if (currentUser.uid === listing?.userId) {
      alert("This is your own listing. You can't chat with yourself.");
      return;
    }

    try {
      const listingOwnerId = listing?.userId;
      const currentUserId = currentUser.uid;
      
      // Create a unique chatId
      const chatId = [currentUserId, listingOwnerId].sort().join('_');

      // Reference to the chat in the database
      const chatRef = ref(database, `chats/${chatId}`);

      // Check if the chat already exists
      const chatSnapshot = await get(chatRef);

      if (!chatSnapshot.exists()) {
        // If the chat doesn't exist, create it
        await set(chatRef, {
          participants: {
            [currentUserId]: true,
            [listingOwnerId]: true
          },
          listingId: listing?.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Create initial message
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        await push(messagesRef, {
          senderId: currentUserId,
          text: `Hi, I'm interested in your listing: ${listing?.title}`,
          timestamp: serverTimestamp()
        });

        // Add chat to both users' userChats
        await set(ref(database, `userChats/${currentUserId}/${chatId}`), {
          withUser: listingOwnerId,
          listingId: listing?.id,
          listingTitle: listing?.title,
          lastMessage: `Hi, I'm interested in your listing: ${listing?.title}`,
          timestamp: serverTimestamp()
        });

        await set(ref(database, `userChats/${listingOwnerId}/${chatId}`), {
          withUser: currentUserId,
          listingId: listing?.id,
          listingTitle: listing?.title,
          lastMessage: `Hi, I'm interested in your listing: ${listing?.title}`,
          timestamp: serverTimestamp()
        });
      }

      // Navigate to the chat page
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to create chat. Please try again.");
    }
  };

  const handleDeleteListing = async () => {
    if (!listing || !currentUser || currentUser.uid !== listing.userId) {
      return;
    }

    try {
      const listingRef = ref(database, `listings/${id}`);
      await remove(listingRef);
      router.push('/profile'); // Redirect to profile page after deletion
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!listing) return <div>Listing not found</div>;

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

          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <BedDouble className="h-5 w-5 mr-1" />
                <span>{listing.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-5 w-5 mr-1" />
                <span>{listing.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center">
                <Square className="h-5 w-5 mr-1" />
                <span>{listing.totalArea} m²</span>
              </div>
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
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold">${listing.rentPrice}/month</p>
            {currentUser && currentUser.uid === listing.userId ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Listing
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your listing.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteListing}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={handleChatClick}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Owner
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}