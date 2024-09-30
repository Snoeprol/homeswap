Firebase Chat System with Next.js - High-Level Requirements
Database Structure
Chats Collection
Each chat object must have:
user1: ID of the first user.
user2: ID of the second user.
messages: Sub-collection containing individual message documents.
Messages Sub-collection
Each message object must have:
senderId: ID of the user who sent the message.
text: The content of the message.
timestamp: The time the message was sent.
/chat/[id]/page.tsx Requirements
Fetch messages for the chat based on the chat ID from the URL.
Display messages in real-time.
Identify sender by checking if senderId matches the current user.
Allow sending new messages and immediately show them on both users' screens.
/chats/page.tsx Requirements
Fetch chats where the current user is either user1 or user2.
Display a list of chats with links to the corresponding chat pages.
Show chats in real-time as they are created or updated.