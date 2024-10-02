'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, storage, database } from '@/lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as databaseRef, get, set } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  propertyType: string;
  rentPrice: number;
  city: string;
  country: string;
  images: string[];
  userId: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState(auth.currentUser);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setNewDisplayName(user.displayName || '');
        setNewPhotoURL(user.photoURL || '');
        fetchUserListings(user.uid);
      } else {
        router.push('/auth');
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const fetchUserListings = async (userId: string) => {
    const listingsRef = databaseRef(database, 'listings');
    const snapshot = await get(listingsRef);
    if (snapshot.exists()) {
      const allListings = snapshot.val();
      const userListings = Object.entries(allListings)
        .filter(([, listing]) => (listing as Listing).userId === userId)
        .map(([key, data]) => {
          const { id, ...rest } = data as Listing;
          return {
            ...rest,
            id: key, // Use the Firebase key as the id
          };
        });
      setUserListings(userListings);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    setUpdateMessage('');
    const startTime = Date.now();

    try {
      await updateProfile(user, {
        displayName: newDisplayName,
        photoURL: newPhotoURL,
      });
      
      // Update user profile in Realtime Database
      const userRef = databaseRef(database, `users/${user.uid}`);
      await set(userRef, {
        displayName: newDisplayName,
        email: user.email,
        photoURL: newPhotoURL,
      });
      
      setUser({ ...user, displayName: newDisplayName, photoURL: newPhotoURL });
      
      const updateTime = Date.now() - startTime;
      if (updateTime > 5000) {
        setUpdateMessage('Profile updated successfully, but it took longer than expected. Please check your internet connection.');
      } else {
        setUpdateMessage('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error instanceof Error) {
        console.log('Error details:', error.message);
        setUpdateMessage(`Failed to update profile: ${error.message}`);
      } else {
        setUpdateMessage('An unknown error occurred while updating the profile');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const imageRef = storageRef(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      await updateProfile(user, {
        photoURL: downloadURL,
      });
      
      // Update user profile in Realtime Database
      const userRef = databaseRef(database, `users/${user.uid}`);
      await set(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: downloadURL,
      });
      
      setNewPhotoURL(downloadURL);
      setUser({ ...user, photoURL: downloadURL });
      setUpdateMessage('Profile picture updated successfully!');
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setUpdateMessage('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isOnline) {
    return <div>You are currently offline. Please check your internet connection.</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="bg-gradient-to-b from-orange-50 to-amber-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <div className="flex flex-col items-center mb-6">
            <Image
              src={user.photoURL || '/default-avatar.jpg'}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full mb-4"
            />
            <p className="text-xl font-semibold">{user.displayName || 'User'}</p>
            <p className="text-gray-600">{user.email}</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              {isUploading ? 'Uploading...' : 'Change Profile Picture'}
            </Button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-gray-700">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
          {updateMessage && (
            <div className={`mt-4 p-3 rounded ${updateMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {updateMessage}
            </div>
          )}
          <Button onClick={handleLogout} variant="outline" className="w-full mt-4 border-orange-500 text-orange-500 hover:bg-orange-50">
            Logout
          </Button>
          
          {/* User's Active Listings Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Your Active Listings</h2>
            {userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      <p className="text-orange-600 font-bold">€{listing.rentPrice}/month</p>
                      <Link href={`/listing/${listing.id}`} passHref>
                        <Button className="mt-2 w-full">View Listing</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>You don&apos;t have any active listings yet.</p>
            )}
            <Link href="/list-your-house" passHref>
              <Button className="mt-6 w-full">Create New Listing</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}