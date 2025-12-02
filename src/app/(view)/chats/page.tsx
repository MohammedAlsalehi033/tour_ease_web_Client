import React from 'react';
import { container } from '@/app/lib/diContainer';
import { Chat } from '../../(model)/chat/chatModel';
import { ChatController } from '@/app/(controller)/chat/chatController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import ChatList from './ChatList';

const Page = async () => {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Please Sign In</h2>
          <Link href="/auth/signin" className="btn-primary px-8 py-3 rounded-full">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  let chats: Chat[] = [];
  try {
    const chatController = container.resolve(ChatController);
    chats = await chatController.fetchChats(userId);
  } catch (error) {
    console.error('Error fetching chats:', error);
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Top Decoration */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
      
      <ChatList initialChats={chats} />
    </div>
  );
};

export default Page;
