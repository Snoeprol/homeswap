'use client';

import { useState, useEffect } from 'react';
import { auth, database } from '@/lib/firebase';
import { ref, push, onChildAdded, off } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  listingId: string;
}

const Chat: React.FC<ChatProps> = ({ listingId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const chatRef = ref(database, `chats/${listingId}`);
    const handleNewMessage = onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, { id: snapshot.key!, ...message }]);
    });

    return () => {
      off(chatRef, 'child_added', handleNewMessage);
    };
  }, [listingId]);

  const sendMessage = async () => {
    if (!currentUser || !newMessage.trim()) return;

    const chatRef = ref(database, `chats/${listingId}`);
    await push(chatRef, {
      senderId: currentUser.uid,
      text: newMessage.trim(),
      timestamp: Date.now(),
    });

    setNewMessage('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="h-64 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 ${
              message.senderId === currentUser?.uid ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.senderId === currentUser?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </span>
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