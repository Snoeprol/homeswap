'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RepeatIcon, InfoIcon, SearchIcon, UserIcon, LogInIcon, HomeIcon } from "lucide-react";
import { auth } from '@/lib/firebase';

export default function Navbar() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <RepeatIcon className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">HouseSwap</span>
          </Link>
          <div className="hidden md:flex space-x-4 items-center">
            <Link href="/how-it-works" className="flex items-center text-gray-600 hover:text-orange-500 transition-colors">
              <InfoIcon className="h-5 w-5 mr-1" />
              How It Works
            </Link>
            <Link href="/browse" className="flex items-center text-gray-600 hover:text-orange-500 transition-colors">
              <SearchIcon className="h-5 w-5 mr-1" />
              Browse Homes
            </Link>
            <Link href="/list-your-house" className="flex items-center text-gray-600 hover:text-orange-500 transition-colors">
              <HomeIcon className="h-5 w-5 mr-1" />
              List Your House
            </Link>
            {user ? (
              <Button asChild variant="ghost" className="text-gray-600 hover:text-orange-500">
                <Link href="/profile" className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Profile
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" className="text-gray-600 hover:text-orange-500">
                <Link href="/auth" className="flex items-center">
                  <LogInIcon className="h-5 w-5 mr-2" />
                  Login / Sign Up
                </Link>
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <RepeatIcon className="h-6 w-6" />
          </Button>
        </nav>
      </div>
    </header>
  );
}