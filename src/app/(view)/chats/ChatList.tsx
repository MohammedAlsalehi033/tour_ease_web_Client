'use client';

import React, { useState } from 'react';
import { Chat } from '../../(model)/chat/chatModel';
import { MessageCircle, Search, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import OtherAvatarPic from '../components/otherAvatarPic';

const formatTimestamp = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((+now - +date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((+now - +date) / (1000 * 60));
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m`;
  }
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const ChatItem = ({ chat }: { chat: Chat }) => {
  return (
    <Link href={`/chats/${chat.partnerId}`} className="block group">
      <div className={`
        relative p-5 rounded-xl transition-all duration-200
        ${chat.isUnread 
          ? 'bg-primary/5 dark:bg-primary/10' 
          : 'hover:bg-gray-50 dark:hover:bg-white/5'}
      `}>
        <div className="flex items-center gap-5">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12">
                <OtherAvatarPic imageUrl={chat.avatarUrl} otherUserId={chat.partnerId} userName={chat.userName} />
            </div>
            {chat.isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm"></span>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1.5">
              <h3 className={`text-lg truncate pr-2 ${
                chat.isUnread 
                  ? 'font-bold text-light-text dark:text-dark-text' 
                  : 'font-medium text-light-text/90 dark:text-dark-text/90'
              }`}>
                {chat.userName || 'Unknown User'}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                {formatTimestamp(chat.timestamp)}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <p className={`text-base truncate flex-1 ${
                chat.isUnread 
                  ? 'text-light-text dark:text-dark-text font-medium' 
                  : 'text-light-text-secondary dark:text-dark-text-secondary'
              }`}>
                {chat.lastMessage || 'Start a conversation...'}
              </p>
              
              {chat.isUnread && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/30"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const EmptyState = ({ isSearch = false }: { isSearch?: boolean }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center h-full">
    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
      {isSearch ? (
        <Search className="w-8 h-8 text-gray-400" />
      ) : (
        <MessageCircle className="w-8 h-8 text-gray-400" />
      )}
    </div>
    <h3 className="text-xl font-medium text-light-text dark:text-dark-text mb-2">
      {isSearch ? 'No conversations found' : 'No messages yet'}
    </h3>
    <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-xs mx-auto mb-8 text-base">
      {isSearch 
        ? "We couldn't find any conversations matching your search."
        : "Connect with other travelers or drivers to start planning your journey."}
    </p>
    {!isSearch && (
      <Link href="/rides" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105">
        <Search className="w-4 h-4" />
        <span>Find a Ride</span>
      </Link>
    )}
  </div>
);

const SafetyTip = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
    <div className="flex-shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-1">{title}</h4>
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{desc}</p>
    </div>
  </div>
);

interface ChatListProps {
  initialChats: Chat[];
}

export default function ChatList({ initialChats }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredChats = initialChats.filter(chat => 
    chat.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Messages
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            You have {initialChats.length} conversation{initialChats.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="block w-full pl-11 pr-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-light-text dark:text-dark-text placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Chat List Container */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          {filteredChats.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto flex-1">
              {filteredChats.map((chat) => (
                <ChatItem key={chat.partnerId} chat={chat} />
              ))}
            </div>
          ) : (
            <EmptyState isSearch={searchQuery.length > 0} />
          )}
        </div>

        {/* Sidebar for Warnings/Instructions */}
        <div className="hidden xl:block w-80 space-y-6 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Safety Tips</h3>
            </div>
            <div className="space-y-4">
              <SafetyTip 
                icon={AlertCircle}
                title="Keep it on Tour Ease"
                desc="For your safety, keep all communication and payments within the platform."
              />
              <SafetyTip 
                icon={Shield}
                title="Verify Profiles"
                desc="Check user reviews and verification status before agreeing to a ride."
              />
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 p-6">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Need Help?</h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              If you encounter any suspicious behavior or have questions, our support team is here to help.
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
}
