'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, database } from '@/lib/firebase';
import { ref, onValue, off, get } from 'firebase/database';
import Link from 'next/link';
import { MessageCircleIcon } from 'lucide-react';

interface Message {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface Chat {
  id: string;
  lastMessage: Message;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    console.log("Current user:", user);

    if (!user) {
      console.log("No user, redirecting to auth");
      router.push('/auth');
      return;
    }

    const chatsRef = ref(database, 'chats');
    console.log("Fetching chats");

    const fetchChats = async () => {
      setLoading(true);
      try {
        const snapshot = await get(chatsRef);
        if (snapshot.exists()) {
          const chatsData = snapshot.val();
          console.log("Chats data:", chatsData);
          const chatsArray: Chat[] = [];
          
          for (const [chatId, messages] of Object.entries(chatsData)) {
            const messagesArray = Object.values(messages as Record<string, Message>);
            if (messagesArray.some(msg => msg.senderId === user.uid)) {
              const lastMessage = messagesArray[messagesArray.length - 1];
              chatsArray.push({
                id: chatId,
                lastMessage: lastMessage
              });
            }
          }
          
          setChats(chatsArray.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp));
        } else {
          console.log("No chats found");
          setChats([]);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    const handleChats = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        const chatsArray: Chat[] = [];
        
        for (const [chatId, messages] of Object.entries(chatsData)) {
          const messagesArray = Object.values(messages as Record<string, Message>);
          if (messagesArray.some(msg => msg.senderId === user.uid)) {
            const lastMessage = messagesArray[messagesArray.length - 1];
            chatsArray.push({
              id: chatId,
              lastMessage: lastMessage
            });
          }
        }
        
        setChats(chatsArray.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp));
      } else {
        setChats([]);
      }
    });

    return () => off(chatsRef, 'value', handleChats);
  }, [router]);

  if (loading) {
    return <div>Loading chats...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Chats</h1>
      {chats.length > 0 ? (
        <ul className="space-y-4">
          {chats.map((chat) => (
            <li key={chat.id} className="bg-white rounded-lg shadow p-4">
              <Link href={`/chat/${chat.id}`} className="flex items-center">
                <MessageCircleIcon className="h-6 w-6 mr-2 text-orange-500" />
                <div>
                  <h2 className="font-semibold">Chat {chat.id}</h2>
                  <p className="text-sm text-gray-600">{chat.lastMessage.text}</p>
                  <p className="text-xs text-gray-400">{new Date(chat.lastMessage.timestamp).toLocaleString()}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>You don't have any active chats.</p>
      )}
    </div>
  );
}