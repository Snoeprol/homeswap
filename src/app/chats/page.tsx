'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { MessageSquareIcon, PlusCircleIcon } from "lucide-react";
import { auth, database } from '@/lib/firebase';
import { ref, onValue, off, get } from 'firebase/database';

interface User {
  id: string;
  displayName: string;
  photoURL: string;
}

interface Chat {
  id: string;
  participants?: {
    [uid: string]: User
  };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('ChatsPage: useEffect triggered');
    const user = auth.currentUser;

    if (!user) {
      console.log('ChatsPage: No user found, redirecting to /auth');
      router.push('/auth');
      return;
    }

    console.log('ChatsPage: Current user:', user.uid);

    const userChatsRef = ref(database, `userChats/${user.uid}`);
    console.log('ChatsPage: Listening to Firebase path:', `userChats/${user.uid}`);

    const handleChats = onValue(userChatsRef, async (snapshot) => {
      console.log('ChatsPage: Firebase data updated');
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        console.log('ChatsPage: Raw chats data:', chatsData);
        const chatsArray = await Promise.all(Object.entries(chatsData).map(async ([id, chat]) => {
          const chatData = chat as Chat;
          const [userId1, userId2] = id.split('_');
          const otherUserId = userId1 === user.uid ? userId2 : userId1;
          
          console.log('ChatsPage: Fetching data for chat:', id);
          try {
            // Fetch listing data
            const listingSnapshot = await get(ref(database, `listings/${chatData.listingId}`));
            if (listingSnapshot.exists()) {
              const listingData = listingSnapshot.val();
              chatData.listingTitle = listingData.title;
              chatData.listingImage = listingData.images[0] || '/placeholder.jpg';
            }

            // Fetch other user's data
            const userSnapshot = await get(ref(database, `users/${otherUserId}`));
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              chatData.participants = {
                [otherUserId]: {
                  id: otherUserId,
                  displayName: userData.displayName || 'Unknown',
                  photoURL: userData.photoURL || '/default-avatar.jpg'
                }
              };
            }

            return {
              ...chatData,
              id
            };
          } catch (error) {
            console.error('ChatsPage: Error fetching data:', error);
            return {
              ...chatData,
              id,
              participants: {
                [otherUserId]: {
                  id: otherUserId,
                  displayName: 'Error',
                  photoURL: '/default-avatar.jpg'
                }
              }
            };
          }
        }));
        const sortedChats = chatsArray.sort((a, b) => 
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
        );
        console.log('ChatsPage: Processed and sorted chats:', sortedChats);
        setChats(sortedChats);
      } else {
        console.log('ChatsPage: No chats found for user');
        setChats([]);
      }
      setIsLoading(false);
    });

    return () => {
      console.log('ChatsPage: Cleaning up Firebase listener');
      off(userChatsRef, 'value', handleChats);
    };
  }, [router]);

  if (isLoading) {
    console.log('ChatsPage: Still loading...');
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  console.log('ChatsPage: Rendering with', chats.length, 'chats');

  const getOtherParticipant = (chat: Chat): User => {
    const currentUserId = auth.currentUser?.uid;
    const [userId1, userId2] = chat.id.split('_');
    const otherUserId = userId1 === currentUserId ? userId2 : userId1;
    
    console.log('ChatsPage: Getting participant for:', otherUserId);
    console.log('ChatsPage: Chat participants:', chat.participants);

    if (!chat.participants) {
      console.log('ChatsPage: No participants found for chat:', chat.id);
      return { id: otherUserId, displayName: 'Unknown', photoURL: '/default-avatar.jpg' };
    }
    const participant = chat.participants[otherUserId] || { id: otherUserId, displayName: 'Unknown', photoURL: '/default-avatar.jpg' };
    console.log('ChatsPage: Resolved participant:', participant);
    return participant;
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Your Chats</h1>
      {chats.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You have no active chats.</p>
          <Button asChild variant="outline" className="text-orange-500 hover:text-orange-600 border-orange-500 hover:border-orange-600">
            <Link href="/browse" className="flex items-center justify-center">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Start a New Chat
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            return (
              <li key={chat.id} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <Link href={`/chat/${chat.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {otherParticipant.photoURL ? (
                        <Image
                          src={otherParticipant.photoURL}
                          alt={otherParticipant.displayName}
                          width={40}
                          height={40}
                          className="rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {getInitial(otherParticipant.displayName)}
                          </span>
                        </div>
                      )}
                      <h3 className="font-semibold text-lg text-gray-800">{otherParticipant.displayName}</h3>
                    </div>
                    <span className="text-xs text-gray-400">
                      {chat.lastMessage?.timestamp 
                        ? new Date(chat.lastMessage.timestamp).toLocaleString() 
                        : 'No messages'}
                    </span>
                  </div>
                  {chat.listingTitle && (
                    <div className="mt-1 text-sm text-gray-500 flex items-center">
                      <Image
                        src={chat.listingImage || '/placeholder.jpg'}
                        alt={chat.listingTitle}
                        width={24}
                        height={24}
                        className="rounded mr-2 object-cover"
                      />
                      Listing: {chat.listingTitle}
                    </div>
                  )}
                  <div className="mt-2 flex items-center text-gray-600">
                    <MessageSquareIcon className="h-4 w-4 mr-2 text-orange-500" />
                    <p className="text-sm truncate">
                      {chat.lastMessage ? (
                        <>
                          <span className="font-medium">
                            {chat.lastMessage.senderId === auth.currentUser?.uid ? 'You: ' : ''}
                          </span>
                          {chat.lastMessage.text}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}