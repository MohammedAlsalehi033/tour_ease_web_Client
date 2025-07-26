import { CommentsController } from '@/app/(controller)/questions/comments/commentsController';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';
import { Comment } from '@/app/(model)/questions/comments/commentsModel';
import { container } from '@/app/lib/diContainer';
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import AddComment from './addComment';

const page = async (params ) => {
  const questionController = container.resolve(QuestionsController);
  const question = await questionController.getQuestion(params.Questionid);
  const commentsController = container.resolve(CommentsController);
  const comments: Comment[] = await commentsController.getComments(params.Questionid);

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col items-center justify-start pt-16 bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl w-full px-4">
        {/* Question Card */}
        <div className="relative flex bg-gradient-to-br from-primary/10 to-light-surface dark:to-dark-surface rounded-xl shadow-lg border border-light-outline dark:border-dark-outline mb-10">
          {/* Vertical Accent Bar */}
          <div className="w-2 rounded-l-xl bg-primary" />
          {/* Vote Bar */}
          <div className="flex flex-col items-center justify-center px-4 py-6">
            <button className="p-1 rounded hover:bg-primary/10">
              <ArrowUpIcon className="w-6 h-6 text-primary" />
            </button>
            <span className="font-bold text-xl text-primary my-1">{question.upvotes ?? 0}</span>
            <button className="p-1 rounded hover:bg-primary/10">
              <ArrowDownIcon className="w-6 h-6 text-primary" />
            </button>
          </div>
          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* User Header */}
            <div className="flex items-center gap-3 mb-2">
              <img
                src={question.user.mediaUrls[0]}
                alt="avatar"
                className="h-10 w-10 rounded-full object-cover object-center border-2 border-primary"
              />
              <span className="font-semibold text-md text-light-on-surface dark:text-dark-on-surface">{question.user.username}</span>
              <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant ml-auto">
                {new Date(question.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="border-b border-light-outline dark:border-dark-outline mb-3" />
            <h1 className="text-title-lg font-bold mb-2 text-light-on-surface dark:text-dark-on-surface">{question.title}</h1>
            <p className="text-body-md mb-2 text-light-on-surface dark:text-dark-on-surface">{question.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <h2 className="text-headline-md font-semibold mb-4 text-light-on-surface dark:text-dark-on-surface flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" /> Comments
        </h2>
        {comments.length === 0 && (
          <div className="card p-8 mb-4 flex flex-col items-center text-light-on-surface-variant dark:text-dark-on-surface-variant">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mb-2 text-primary/40" />
            <span className="font-medium">No comments yet. Be the first to comment!</span>
          </div>
        )}
        <div className="space-y-4 pb-32">
          {comments.map((comment) => (
            <div key={comment.id} className="card p-4 flex items-start gap-4 border-l-4 border-primary bg-light-surface dark:bg-dark-surface">
              <img
                src={comment.user.mediaUrls[0]}
                alt="avatar"
                className="h-9 w-9 rounded-full object-cover object-center border border-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-md text-light-on-surface dark:text-dark-on-surface">{comment.user.username}</span>
                  <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant ml-auto">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-body-md text-light-on-surface dark:text-dark-on-surface">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

          <AddComment questionId={params.Questionid} />
        
      </div>
    </div>
  );
};

export default page;
