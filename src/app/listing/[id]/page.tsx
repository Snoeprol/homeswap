'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { database, auth } from '@/lib/firebase';
import { ref, get, set, push, serverTimestamp, remove } from 'firebase/database';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, BedDouble, Bath, Square, Wifi, Tv, Car, Snowflake, Coffee, MessageCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User as FirebaseUser } from 'firebase/auth';

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

// Modify the User interface to match Firebase User properties
interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

const amenityIcons: { [key: string]: JSX.Element } = {
  "Wi-Fi": <Wifi className="h-4 w-4" />,
  "TV": <Tv className="h-4 w-4" />,
  "Parking": <Car className="h-4 w-4" />,
  "Air Conditioning": <Snowflake className="h-4 w-4" />,
  "Coffee Maker": <Coffee className="h-4 w-4" />,
};

const MAX_TITLE_LENGTH = 50; // Set the maximum title length

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function ListingPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const listingRef = ref(database, `listings/${id}`);
        const snapshot = await get(listingRef);

        if (snapshot.exists()) {
          const listingData = snapshot.val();
          setListing({ id, ...listingData });

          const ownerRef = ref(database, `users/${listingData.userId}`);
          const ownerSnapshot = await get(ownerRef);
          if (ownerSnapshot.exists()) {
            setOwner({ id: listingData.userId, ...ownerSnapshot.val() });
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

    fetchListing();
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
      
      if (!listingOwnerId || !currentUserId) {
        throw new Error("Missing user IDs");
      }

      const chatId = [currentUserId, listingOwnerId].sort().join('_');
      const chatRef = ref(database, `chats/${chatId}`);
      const chatSnapshot = await get(chatRef);

      if (!chatSnapshot.exists()) {
        const participants: { [key: string]: boolean } = {};
        participants[currentUserId] = true;
        participants[listingOwnerId] = true;

        await set(chatRef, {
          participants,
          listingId: listing?.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        const messagesRef = ref(database, `chats/${chatId}/messages`);
        await push(messagesRef, {
          senderId: currentUserId,
          text: `Hi, I'm interested in your listing: ${listing?.title}`,
          timestamp: serverTimestamp()
        });

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
      router.push('/profile');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!listing) return <div className="container mx-auto px-4 py-8">Listing not found</div>;

  const truncatedTitle = truncateText(listing.title, MAX_TITLE_LENGTH);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{truncatedTitle}</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm md:text-base">{listing.address}, {listing.city}, {listing.country}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full max-w-xs md:max-w-md mx-auto">
            <CarouselContent>
              {listing.images.map((image, index) => (
                <CarouselItem key={index}>
                  <Image src={image} alt={`Listing image ${index + 1}`} width={300} height={200} className="rounded-lg object-cover w-full h-48 md:h-64" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
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
            <Badge variant={listing.isRentInclusive ? "default" : "secondary"}>
              {listing.isRentInclusive ? "All-inclusive" : "Utilities not included"}
            </Badge>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-sm md:text-base">{listing.description}</p>
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
              <p className="text-sm md:text-base">{listing.houseRules}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar>
              <AvatarImage src={owner?.photoURL || undefined} />
              <AvatarFallback>{owner?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{owner?.displayName}</p>
              <p className="text-sm text-gray-500">{owner?.email}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
            <p className="text-2xl font-bold">€{listing.rentPrice}/month</p>
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
              <Button onClick={handleChatClick} className="w-full md:w-auto">
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