'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { RepeatIcon, InfoIcon, SearchIcon, UserIcon, LogInIcon, HomeIcon, LogOutIcon, MessageCircleIcon, MenuIcon, XIcon } from "lucide-react";
import { auth, database } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { ref, onValue, off } from 'firebase/database';

interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  timestamp: number;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
      if (user) {
        fetchChats(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchChats = (userId: string) => {
    const chatsRef = ref(database, `userChats/${userId}`);
    onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        const chatsArray = Object.entries(chatsData).map(([key, chatData]) => {
          const chat = chatData as Chat;
          return {
            ...chat,
            id: key, // This will overwrite any existing 'id' in the chat object
          };
        });
        setChats(chatsArray);
      }
    });

    return () => off(chatsRef);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const NavItems = () => (
    <>
      <Link href="/how-it-works" className="flex items-center text-gray-600 hover:text-orange-500 transition-colors">
        <InfoIcon className="h-5 w-5 mr-1" />
        How It Works
      </Link>
      <Link href="/browse" className="flex items-center text-gray-600 hover:text-orange-500 transition-colors">
        <SearchIcon className="h-5 w-5 mr-1" />
        Browse Homes
      </Link>
      {user ? (
        <>
          <Link href="/list-your-house" className="flex items-center text-gray-600 hover:text-orange-500 transition-colors">
            <HomeIcon className="h-5 w-5 mr-1" />
            List Your House
          </Link>
          <Link href="/chats" className="flex items-center text-gray-600 hover:text-orange-500 transition-colors">
            <MessageCircleIcon className="h-5 w-5 mr-1" />
            Chats
          </Link>
          <Button asChild variant="ghost" className="text-gray-600 hover:text-orange-500">
            <Link href="/profile" className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Profile
            </Link>
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="text-gray-600 hover:text-orange-500">
            <LogOutIcon className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <Button asChild variant="ghost" className="text-gray-600 hover:text-orange-500">
          <Link href="/auth" className="flex items-center">
            <LogInIcon className="h-5 w-5 mr-2" />
            Login / Sign Up
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <RepeatIcon className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">HouseSwap</span>
          </Link>
          <div className="hidden md:flex space-x-4 items-center">
            <NavItems />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </nav>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
            <NavItems />
          </div>
        </div>
      )}
    </header>
  );
}