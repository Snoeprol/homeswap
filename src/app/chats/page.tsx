'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useRouter } from 'next/navigation';

interface Chat {
  id: string;
  withUser: string;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  timestamp: number;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.push('/auth');
      return;
    }

    const userChatsRef = ref(database, `userChats/${user.uid}`);

    const handleChats = onValue(userChatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        const chatsArray = Object.entries(chatsData).map(([id, chat]) => ({
          id,
          ...(chat as Omit<Chat, 'id'>)
        }));
        setChats(chatsArray.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setChats([]);
      }
    });

    return () => {
      off(userChatsRef, 'value', handleChats);
    };
  }, [router]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Chats</h1>
      {chats.length === 0 ? (
        <p>You have no active chats.</p>
      ) : (
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id} className="bg-white shadow rounded-lg p-4">
              <Link href={`/chat/${chat.id}`} className="text-blue-500 hover:underline">
                <h3 className="font-semibold">{chat.listingTitle}</h3>
                <p className="text-sm text-gray-600">{chat.lastMessage}</p>
                <p className="text-xs text-gray-400">
                  {new Date(chat.timestamp).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}