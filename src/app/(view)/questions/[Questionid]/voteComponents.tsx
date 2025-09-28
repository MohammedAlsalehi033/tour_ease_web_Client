"use client"
import { QuestionsController } from '@/app/(controller)/questions/questionsController'
import { Question } from '@/app/(model)/questions/questionsModel'
import { container } from '@/app/lib/diContainer'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React from 'react'

interface VoteData {
  userId: string;
  type: 'UPVOTE' | 'DOWNVOTE';
}

const VoteComponents = ({ question }: { question: Question }) => {
  const questionController = container.resolve(QuestionsController);
  const session = useSession();
  const userId = session.data?.user?.id as string;
  
  // Debug: Log the question data structure
  React.useEffect(() => {
    console.log('Question data structure:', {
      id: question.id,
      upvotes: question.upvotes,
      downvotes: question.downvotes,
      vote: question.vote,
      voteType: typeof question.vote,
      voteIsArray: Array.isArray(question.vote),
    });
  }, [question]);
  
  // State management for vote counts and user's current vote
  const [upvotes, setUpvotes] = React.useState<number>(question.upvotes ?? 0);
  const [downvotes, setDownvotes] = React.useState<number>(question.downvotes ?? 0);
  const [userVote, setUserVote] = React.useState<'UPVOTE' | 'DOWNVOTE' | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync state with props when question data changes
  React.useEffect(() => {
    setUpvotes(question.upvotes ?? 0);
    setDownvotes(question.downvotes ?? 0);
  }, [question.upvotes, question.downvotes]);

  // Initialize user's current vote from question data
  React.useEffect(() => {
    if (userId && question.vote && Array.isArray(question.vote)) {
      const currentUserVote = question.vote.find((vote: VoteData) => vote.userId === userId);
      if (currentUserVote) {
        setUserVote(currentUserVote.type);
        console.log(`User ${userId} has existing vote: ${currentUserVote.type} on question ${question.id}`);
      } else {
        setUserVote(null);
        console.log(`User ${userId} has no existing vote on question ${question.id}`);
      }
    } else {
      setUserVote(null);
      console.log(`No vote data available for question ${question.id}:`, { 
        userId, 
        hasVoteArray: question.vote && Array.isArray(question.vote),
        voteData: question.vote 
      });
    }
  }, [userId, question.vote, question.id]);

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!userId) {
      setError("You must be logged in to vote.");
      return;
    }

    setLoading(true);
    setError(null);

    // Store original state for rollback
    const originalUpvotes = upvotes;
    const originalDownvotes = downvotes;
    const originalUserVote = userVote;

    try {
      // Optimistic UI update
      let newUpvotes = upvotes;
      let newDownvotes = downvotes;
      let newUserVote: 'UPVOTE' | 'DOWNVOTE' | null = null;

      if (userVote === voteType) {
        // User is canceling their vote
        if (voteType === 'UPVOTE') {
          newUpvotes = Math.max(0, upvotes - 1);
        } else {
          newDownvotes = Math.max(0, downvotes - 1);
        }
        newUserVote = null;
      } else if (userVote) {
        // User is changing their vote
        if (voteType === 'UPVOTE') {
          newUpvotes = upvotes + 1;
          newDownvotes = Math.max(0, downvotes - 1);
        } else {
          newDownvotes = downvotes + 1;
          newUpvotes = Math.max(0, upvotes - 1);
        }
        newUserVote = voteType;
      } else {
        // User is casting a new vote
        if (voteType === 'UPVOTE') {
          newUpvotes = upvotes + 1;
        } else {
          newDownvotes = downvotes + 1;
        }
        newUserVote = voteType;
      }

      // Apply optimistic update
      setUpvotes(newUpvotes);
      setDownvotes(newDownvotes);
      setUserVote(newUserVote);

      // Make API call
      const result = await questionController.voteQuestion(question.id, userId, voteType === 'UPVOTE');
      
      // Update with actual server response if available
      if (result && typeof result === 'object') {
        if (result.upvotes !== undefined) {
          setUpvotes(result.upvotes);
        }
        if (result.downvotes !== undefined) {
          setDownvotes(result.downvotes);
        }
        
        // Update user vote state based on server response
        // The server response should include the updated vote array
        if (result.vote && Array.isArray(result.vote)) {
          const updatedUserVote = result.vote.find((vote: VoteData) => vote.userId === userId);
          setUserVote(updatedUserVote?.type || null);
        } else {
          // If no vote array in response, trust our local optimistic update
          setUserVote(newUserVote);
        }
      } else {
        // Fallback to optimistic update if no proper response
        setUserVote(newUserVote);
      }

      console.log(`Vote ${voteType} processed successfully for question ${question.id}`);

    } catch (e: any) {
      // Rollback optimistic update on error
      setUpvotes(originalUpvotes);
      setDownvotes(originalDownvotes);
      setUserVote(originalUserVote);
      setError(e?.message || "Failed to vote. Try again.");
      console.error('Vote error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 space-y-3">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('UPVOTE')}
        disabled={loading}
        className={`p-2 rounded-lg transition-all duration-200 ${
          userVote === 'UPVOTE'
            ? 'bg-primary/20 text-primary border-2 border-primary/40' 
            : 'hover:bg-primary/10 text-gray-600 hover:text-primary border-2 border-transparent'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ArrowUpIcon className="w-6 h-6" />
      </button>

      {/* Upvote Count */}
      <div className="text-center">
        <div className="font-bold text-lg text-primary">{upvotes}</div>
        <div className="text-xs text-gray-500">upvotes</div>
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('DOWNVOTE')}
        disabled={loading}
        className={`p-2 rounded-lg transition-all duration-200 ${
          userVote === 'DOWNVOTE'
            ? 'bg-red-100 text-red-600 border-2 border-red-300' 
            : 'hover:bg-red-50 text-gray-600 hover:text-red-600 border-2 border-transparent'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ArrowDownIcon className="w-6 h-6" />
      </button>

      {/* Downvote Count */}
      <div className="text-center">
        <div className="font-bold text-lg text-red-600">{downvotes}</div>
        <div className="text-xs text-gray-500">downvotes</div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-xs text-center mt-2 max-w-20">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-primary text-xs text-center">
          Voting...
        </div>
      )}
    </div>
  );
}

export default VoteComponents
