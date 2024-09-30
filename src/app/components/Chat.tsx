import React from 'react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

interface ChatProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (e: React.FormEvent) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, currentUserId, onSendMessage, newMessage, setNewMessage }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 ${
              message.senderId === currentUserId ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.senderId === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-black'
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={onSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
