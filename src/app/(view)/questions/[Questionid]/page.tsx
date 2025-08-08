import { CommentsController } from '@/app/(controller)/questions/comments/commentsController';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';
import { Comment } from '@/app/(model)/questions/comments/commentsModel';
import { container } from '@/app/lib/diContainer';
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import AddComment from './addComment';
import VoteComponents from './voteComponents';
import EditQuestion from './EditQuestion';
import OtherAvatarPic from '../../components/otherAvatarPic';

const page = async ({ params }: { params: { Questionid: string } }) => {
  const questionController = container.resolve(QuestionsController);
  const question = await questionController.getQuestion(params.Questionid);
  const commentsController = container.resolve(CommentsController);
  const comments: Comment[] = await commentsController.getComments(params.Questionid);
  console.log(question  );

  // Helper for relative time
  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }


  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide transition-colors duration-300 flex flex-col items-center justify-start pt-16 bg-light-background dark:bg-dark-background">
      <div className="w-full px-4">
        
        {/* Question Card */}
        <div className="relative flex bg-gradient-to-br from-primary/10 to-light-surface dark:to-dark-surface rounded-2xl shadow-xl border border-primary/20 dark:border-dark-outline/40 mb-10 overflow-hidden">
          {/* Vertical Accent Bar */}
          <div className="w-2 rounded-l-2xl bg-primary" />
          {/* Vote Bar */}
          <div className="flex flex-col items-center justify-center p-4">
            <VoteComponents question={question} />  
          </div>
          {/* Main Content */}
          <div className="flex-1 p-7">
            {/* User Header */}
            <div className="flex items-center gap-3 mb-2">
              {question.user.mediaUrls && question.user.mediaUrls[0] ? (
               <OtherAvatarPic imageUrl={question.user.mediaUrls[0]} otherUserId={question.user.id} />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary shadow">
                  {question.user.username ? question.user.username[0].toUpperCase() : '?'}
                </div>
              )}
              <span className="font-semibold text-md text-primary">{question.user.username}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {timeAgo(question.createdAt)}
              </span>
              <EditQuestion currentDescription={question.description} currentTitle={question.title} questionId={question.id.toString()} />
            </div>
            <div className="border-b border-primary/10 dark:border-dark-outline/30 mb-3" />
            <h1 className="text-title-lg font-bold mb-2 text-dark-on-surface dark:text-light-on-surface">{question.title}</h1>
            <p className="text-body-md mb-2 text-gray-700 dark:text-gray-300">{question.description}</p>
            {/* Tags */}
            {Array.isArray(question.tags) && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {question.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <h2 className="text-headline-md font-semibold mb-4 text-dark-on-surface dark:text-light-on-surface flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" /> Comments
        </h2>
        {comments.length === 0 && (
          <div className="card p-8 mb-4 flex flex-col items-center text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mb-2 text-primary/40" />
            <span className="font-medium">No comments yet. Be the first to comment!</span>
          </div>
        )}
        <div className="space-y-4 pb-32">
          {comments.map((comment) => (
            <div key={comment.id} className="card p-4 flex items-start gap-4 border-l-4 border-primary/60 bg-white dark:bg-dark-surface rounded-xl shadow">
              {comment.user.mediaUrls && comment.user.mediaUrls[0] ? (
                <img
                  src={comment.user.mediaUrls[0]}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover object-center border border-primary shadow"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-md border border-primary shadow">
                  {comment.user.username ? comment.user.username[0].toUpperCase() : '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-md text-primary">{comment.user.username}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-body-md text-gray-700 dark:text-gray-300">{comment.content}</p>
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
