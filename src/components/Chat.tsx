'use client';

import { useState, useEffect } from 'react';
import { auth, database } from '@/lib/firebase';
import { ref, push, onChildAdded, off, get } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  senderName: string;
  senderImage: string;
}

interface ChatProps {
  listingId: string;
}

const Chat: React.FC<ChatProps> = ({ listingId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [listingTitle, setListingTitle] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const chatRef = ref(database, `chats/${listingId}`);
    const listingRef = ref(database, `listings/${listingId}`);

    // Fetch listing title
    get(listingRef).then((snapshot) => {
      if (snapshot.exists()) {
        setListingTitle(snapshot.val().title);
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
  }, [listingId]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const sendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return;

    const chatRef = ref(database, `chats/${listingId}`);
    await push(chatRef, {
      senderId: currentUser.uid,
      text: newMessage.trim(),
      timestamp: Date.now(),
      senderName: currentUser.displayName || 'Anonymous',
      senderImage: currentUser.photoURL || '/default-avatar.jpg',
    });

    setNewMessage('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Link href={`/listing/${listingId}`} className="text-blue-500 hover:underline mb-4 block">
        View Listing: {listingTitle}
      </Link>
      <div className="h-64 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex ${
              message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
            }`}
          >
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
              className={`inline-block p-2 rounded-lg ${
                message.senderId === currentUser?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
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
        ))}
      </div>
      <div className="flex">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow mr-2"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default Chat;