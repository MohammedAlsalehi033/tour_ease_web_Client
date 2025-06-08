import React from 'react'
import { container } from '@/app/lib/diContainer';
import { Chat } from '../../(model)/chat/chatModel';
import { ChatController } from '@/app/(controller)/chat/chatController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { AuthOptions, SessionStrategy } from "next-auth";
import { 
  MessageCircle, 
  Search, 
  User,
  Clock,
  CheckCheck,
  Check,
  Circle
} from 'lucide-react';
import Link from 'next/link';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
  }
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const ChatItem = ({ chat }) => {
  return (
    <Link href={`/chats/${chat.partnerId}`} className="block">
      <div className="card p-4 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-lg">
              {chat.userName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {/* Online status indicator */}
            {chat.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>

          {/* Chat content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                {chat.userName || 'Unknown User'}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Unread indicator */}
                {chat.isUnread && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
                <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  {formatTimestamp(chat.timestamp)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className={`text-body-md truncate flex-1 ${
                chat.isUnread 
                  ? 'font-medium text-light-on-surface dark:text-dark-on-surface' 
                  : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
              }`}>
                {chat.lastMessage || 'No messages yet'}
              </p>
              
              {/* Message status icons */}
              <div className="flex items-center ml-2">
                {!chat.isUnread && (
                  <CheckCheck className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const EmptyState = () => {
  return (
    <div className="card p-12 rounded-lg border border-light-outline dark:border-dark-outline text-center bg-light-surface dark:bg-dark-surface">
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>
      </div>
      <h2 className="text-title-lg mb-3 text-light-on-surface dark:text-dark-on-surface">
        No conversations yet
      </h2>
      <p className="text-body-lg mb-6 text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-md mx-auto">
        Start chatting with other users when you book rides or receive ride requests.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/rides" className="btn-primary py-3 px-6 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
          Browse Rides
        </Link>
        <Link href="/create-listing" className="btn-outlined py-3 px-6 rounded-full border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30 transition-colors">
          Create Listing
        </Link>
      </div>
    </div>
  );
};

const LoginPrompt = () => {
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center px-4">
      <div className="card p-8 rounded-lg border border-light-outline dark:border-dark-outline text-center bg-light-surface dark:bg-dark-surface max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-title-lg mb-3 text-light-on-surface dark:text-dark-on-surface">
          Login Required
        </h2>
        <p className="text-body-lg mb-6 text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Please log in to view your chats and messages.
        </p>
        <Link href="/auth/signin" className="btn-primary py-3 px-6 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};

const page = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <LoginPrompt />;
  }

  let chats = [];
  try {
    const chatController = container.resolve(ChatController);
    chats = await chatController.fetchChats(session.user.id);
  } catch (error) {
    console.error('Error fetching chats:', error);
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                  Messages 
                </h1>
                <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Stay connected with your ride partners
                </p>
              </div>
            </div>
            
            {/* Chat count badge */}
            {chats && chats.length > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                  {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
                </span>
                {chats.some(chat => chat.isUnread) && (
                  <span className="text-sm font-medium px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                    {chats.filter(chat => chat.isUnread).length} unread
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Search bar */}
          {chats && chats.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface placeholder-light-on-surface-variant dark:placeholder-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>

        {/* Chats List */}
        {chats && chats.length > 0 ? (
          <div className="space-y-3">
            {chats.map((chat, index) => (
              <ChatItem key={`${chat.partnerId}-${index}`} chat={chat} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default page;