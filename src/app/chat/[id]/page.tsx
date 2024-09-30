'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, database } from '@/lib/firebase';
import { ref, push, onChildAdded, off, get, remove, set } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { ArrowLeftIcon, SendIcon, BanIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  senderName: string;
  senderImage: string;
}

interface Listing {
  id: string;
  title: string;
  image: string;
  userId: string;
}

interface User {
  id: string;
  displayName: string;
  photoURL: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [listing, setListing] = useState<Listing | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const currentUser = auth.currentUser;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/auth');
      return;
    }

    const chatRef = ref(database, `chats/${id}`);
    const listingRef = ref(database, `listings/${id}`);

    // Fetch listing data
    get(listingRef).then((snapshot) => {
      if (snapshot.exists()) {
        const listingData = snapshot.val();
        setListing({
          id: id as string,
          title: listingData.title,
          image: listingData.images[0] || '/placeholder.jpg',
          userId: listingData.userId
        });

        // Fetch other user's data
        if (listingData.userId !== currentUser?.uid) {
          const userRef = ref(database, `users/${listingData.userId}`);
          get(userRef).then((userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              setOtherUser({
                id: listingData.userId,  // Add this line
                displayName: userData.displayName,
                photoURL: userData.photoURL || '/default-avatar.jpg'
              });
            }
          });
        }
      }
    });

    // Fetch existing messages and listen for new ones
    get(chatRef).then((snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray = Object.entries(messagesData).map(([key, value]) => ({
          ...(value as Message),
          id: key,
        }));
        setMessages(messagesArray);
      }
    });

    const handleNewMessage = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prevMessages) => {
        if (!prevMessages.some(m => m.id === snapshot.key)) {
          return [...prevMessages, { ...message, id: snapshot.key! }];
        }
        return prevMessages;
      });
    });

    return () => {
      off(chatRef, 'child_added', handleNewMessage);
    };
  }, [id, currentUser, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return;

    const chatRef = ref(database, `chats/${id}`);
    const newMessageRef = push(chatRef);
    const messageData = {
      senderId: currentUser.uid,
      text: newMessage.trim(),
      timestamp: Date.now(),
      senderName: currentUser.displayName || 'Anonymous',
      senderImage: currentUser.photoURL || '/default-avatar.jpg',
    };

    await set(newMessageRef, messageData);

    // Update userChats for both users
    const updateUserChats = async (userId: string) => {
      const userChatRef = ref(database, `userChats/${userId}/${id}`);
      await set(userChatRef, {
        lastMessage: newMessage.trim(),
        timestamp: Date.now(),
        listingId: id,
        listingTitle: listing?.title || 'Unknown Listing',
      });
    };

    await updateUserChats(currentUser.uid);
    if (otherUser) {
      await updateUserChats(otherUser.id);  // Changed from otherUser.uid to otherUser.id
    }

    setNewMessage('');
  };

  const blockUser = async () => {
    if (!currentUser || !otherUser) return;
    const blockedRef = ref(database, `blockedUsers/${currentUser.uid}/${otherUser.id}`);  // Changed from otherUser.uid to otherUser.id
    await set(blockedRef, true);
    alert('User blocked successfully');
    router.push('/chats');
  };

  const deleteChat = async () => {
    if (!currentUser) return;
    const chatRef = ref(database, `chats/${id}`);
    await remove(chatRef);
    alert('Chat deleted successfully');
    router.push('/chats');
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  if (!currentUser) {
    return <div>Please log in to view this chat.</div>;
  }

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 flex items-center justify-between">
          <Link href={`/listing/${listing.id}`} className="text-white hover:text-gray-200 transition-colors flex items-center">
            <ArrowLeftIcon className="h-6 w-6 mr-2" />
            <Image
              src={listing.image}
              alt={listing.title}
              width={48}
              height={48}
              className="rounded-full object-cover mr-4"
            />
            <div>
              <h1 className="text-xl font-bold text-white">{listing.title}</h1>
              <p className="text-sm text-white opacity-80">View listing details</p>
            </div>
          </Link>
          {otherUser && (
            <div className="flex items-center">
              {otherUser.photoURL ? (
                <Image
                  src={otherUser.photoURL}
                  alt={otherUser.displayName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {getInitial(otherUser.displayName)}
                  </span>
                </div>
              )}
              <span className="ml-2 text-white font-semibold">{otherUser.displayName}</span>
            </div>
          )}
          <div className="flex items-center">
            <Button onClick={blockUser} variant="ghost" className="text-white mr-2">
              <BanIcon className="h-5 w-5 mr-1" />
              Block User
            </Button>
            <Button onClick={deleteChat} variant="ghost" className="text-white">
              <TrashIcon className="h-5 w-5 mr-1" />
              Delete Chat
            </Button>
          </div>
        </div>
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="flex items-start">
                {message.senderId !== currentUser?.uid && (
                  message.senderImage ? (
                    <Image
                      src={message.senderImage}
                      alt={message.senderName}
                      width={32}
                      height={32}
                      className="rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                      <span className="text-gray-600 font-semibold">
                        {getInitial(message.senderName)}
                      </span>
                    </div>
                  )
                )}
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                    message.senderId === currentUser?.uid
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.senderId !== currentUser?.uid && (
                    <p className="font-semibold text-sm mb-1">{message.senderName}</p>
                  )}
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUser?.uid ? 'text-orange-200' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.senderId === currentUser?.uid && (
                  message.senderImage ? (
                    <Image
                      src={message.senderImage}
                      alt={message.senderName}
                      width={32}
                      height={32}
                      className="rounded-full ml-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2">
                      <span className="text-gray-600 font-semibold">
                        {getInitial(message.senderName)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow mr-2"
            />
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
              <SendIcon className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}