"use client"
import { QuestionsController } from '@/app/(controller)/questions/questionsController'
import { Question } from '@/app/(model)/questions/questionsModel'
import { container } from '@/app/lib/diContainer'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React from 'react'


const VoteComponents = ({ question }: { question: Question }) => {
  const questionController = container.resolve(QuestionsController);
  const session = useSession();
  const userId = session.data?.user?.id as string;
  const [upvotes, setUpvotes] = React.useState<number>(question.upvotes ?? 0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleVote = async (isUpVote: boolean) => {
    if (!userId) {
      setError("You must be logged in to vote.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assume voteQuestion returns the updated upvote count
      const result = await questionController.voteQuestion(question.id, userId, isUpVote);
      if (typeof result === "number") {
        setUpvotes(result);
      } else if (result?.upvotes !== undefined) {
        setUpvotes(result.upvotes);
      } else {
        // fallback: increment/decrement locally
        setUpvotes((prev) => isUpVote ? prev + 1 : prev - 1);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to vote. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center px-4 py-6">
        <button
          onClick={() => handleVote(true)}
          className="p-1 rounded hover:bg-primary/10"
          disabled={loading}
        >
          <ArrowUpIcon className="w-6 h-6 text-primary" />
        </button>
        <span className="font-bold text-xl text-primary my-1">{upvotes}</span>
        <button
          onClick={() => handleVote(false)}
          className="p-1 rounded hover:bg-primary/10"
          disabled={loading}
        >
          <ArrowDownIcon className="w-6 h-6 text-primary" />
        </button>
        {error && <span className="text-red-500 text-sm mt-2">{error}</span>}
      </div>
    </div>
  );
}

export default VoteComponents
