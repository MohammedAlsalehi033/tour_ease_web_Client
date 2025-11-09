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
import { ShieldCheck, MessageSquareText, Users, CheckCircle } from 'lucide-react';
import OtherAvatarPic from '../components/otherAvatarPic';

const formatTimestamp = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((+now - +date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((+now - +date) / (1000 * 60));
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

const ChatItem = ({ chat }: { chat: Chat }) => {
  return (
    <div>
      <Link href={`/chats/${chat.partnerId}`} className="block group">
        <div className="card p-0 rounded-xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface hover:shadow-xl hover:border-primary/50 transition-all duration-200 cursor-pointer flex overflow-hidden relative">
          {/* Colored accent bar */}
          <div className="w-2 bg-gradient-to-b from-primary/80 to-primary/40 dark:from-primary/60 dark:to-primary/20" />
          <div className="flex items-center space-x-4 flex-1 p-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
             
                <OtherAvatarPic imageUrl={chat.avatarUrl} otherUserId={chat.userId} userName={chat.userName} />
               
              {/* Online status indicator with pulse */}
              {chat.isOnline && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-800"></span>
                </span>
              )}
            </div>

            {/* Chat content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                  {chat.userName || 'Unknown User'}
                </h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Unread badge */}
                  {chat.isUnread && (
                    <span className="badge badge-info animate-pulse-glow">New</span>
                  )}
                  <span className="badge bg-light-surface-variant/60 dark:bg-dark-surface-variant/60 text-xs font-semibold px-2 py-0.5">
                    {formatTimestamp(chat.timestamp)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className={`font-sans text-body-md truncate flex-1 ${
                  chat.isUnread
                    ? 'font-semibold text-light-on-surface dark:text-dark-on-surface'
                    : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                }`}>
                  {chat.lastMessage || 'No messages yet'}
                </p>
                {/* Message status icons */}
                <div className="flex items-center ml-2">
                  {!chat.isUnread && (
                    <CheckCheck className="w-4 h-4 text-primary/60" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
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
      <h2 className="font-display text-title-lg mb-3 text-light-on-surface dark:text-dark-on-surface">
        No conversations yet
      </h2>
      <p className="font-sans text-body-lg mb-6 text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-md mx-auto">
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
        <h2 className="font-display text-title-lg mb-3 text-light-on-surface dark:text-dark-on-surface">
          Login Required
        </h2>
        <p className="font-sans text-body-lg mb-6 text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Please log in to view your chats and messages.
        </p>
        <Link href="/auth/signin" className="btn-primary py-3 px-6 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};


// Add this component to your page file

const ChatInstructionsPanel = () => {
  return (
    <div className="card sticky top-24 p-6 rounded-xl border border-light-outline/70 dark:border-dark-outline/70 bg-light-surface-container dark:bg-dark-surface-container">
      <div className="flex items-center mb-4">
        <div className="bg-primary/10 p-3 rounded-full mr-4">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-title-lg font-medium text-light-on-surface dark:text-dark-on-surface">
            Safe Chatting
          </h3>
          <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            A few friendly reminders.
          </p>
        </div>
      </div>
      
      <ul className="space-y-4 font-sans text-body-lg">
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
          <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Keep conversations focused on ride details and coordination.
          </span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
          <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Never share sensitive personal info like passwords or financial details.
          </span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
          <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Be respectful and courteous to your fellow ride-sharers.
          </span>
        </li>
         <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
          <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Report any suspicious or inappropriate behavior immediately.
          </span>
        </li>
      </ul>
    </div>
  );
};


const page = async () => {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    return <LoginPrompt />;
  }

  let chats: Chat[] = [];
  try {
    const chatController = container.resolve(ChatController);
    chats = await chatController.fetchChats(userId);
  } catch (error) {
    console.error('Error fetching chats:', error);
  }

  return (
    // Main container using Flexbox for columns on large screens
    <div className="lg:flex lg:gap-8">

      {/* Column 1: Main Content (your existing chat list) */}
      <div className="lg:w-2/3 flex-shrink-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                  Messages
                </h1>
                <p className="font-sans text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Stay connected with your ride partners
                </p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Chats List */}
        {chats && chats.length > 0 ? (
          <div className="divide-y divide-light-outline/30 dark:divide-dark-outline/30 rounded-xl overflow-hidden shadow-sm">
            {chats.map((chat) => (
              <ChatItem key={chat.partnerId} chat={chat} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Column 2: Instructions Sidebar */}
      <div className="hidden lg:block lg:w-1/3">
        <ChatInstructionsPanel />
      </div>

    </div>
  );
};

export default page;
