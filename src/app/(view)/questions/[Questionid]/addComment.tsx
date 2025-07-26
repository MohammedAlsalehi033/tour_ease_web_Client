"use client"

import { CommentsController } from '@/app/(controller)/questions/comments/commentsController';
import { Comment } from '@/app/(model)/questions/comments/commentsModel';
import { container } from '@/app/lib/diContainer';
import { PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const AddComment = ({questionId}: {questionId: string}) => {
    const [comment, setComment] = useState('');
    const session = useSession();
    const userId = session.data?.user?.id as string;


    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setComment(e.target.value);

    }

    const handleSendComment = () => {
        console.log(userId);

        const commentController = container.resolve(CommentsController);
        commentController.createComment({
            userId: userId,
            questionId: parseInt(questionId),
            content: comment,
            id: 0,
            createdAt: new Date().toISOString(),
            user: {
                id: userId,
                username: session.data?.user?.name as string,
            },
        } as Comment);
    }

  return (
    <div className="card fixed bottom-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-2xl flex items-center gap-3 p-3 rounded-lg border-l-4 border-l-blue-500 shadow-lg border border-light-outline  bg-light-surface dark:bg-dark-surface z-50">
      {/* User avatar placeholder */}
      <div className="">
        <UserCircleIcon className="w-9 h-9 text-primary/60" />
      </div>
      {/* Input */}
      <input
        type="text"
        placeholder="Add a comment..."
        className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-body-md text-light-on-surface dark:text-dark-on-surface"
        value={comment}
        onChange={handleCommentChange}
      />
      {/* Send button */}
      <button onClick={handleSendComment} className="btn btn-primary flex items-center gap-1 px-4 py-2 rounded-full shadow hover:bg-primary-dark transition-colors">
        <PaperAirplaneIcon className="w-5 h-5 text-white rotate-90" />
        <span className="hidden sm:inline">Send</span>
      </button>
    </div>
  )
}

export default AddComment