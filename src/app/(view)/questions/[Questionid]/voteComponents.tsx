"use client"
import { QuestionsController } from '@/app/(controller)/questions/questionsController'
import { Question } from '@/app/(model)/questions/questionsModel'
import { container } from '@/app/lib/diContainer'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React from 'react'

const VoteComponents = ({question}: {question: Question}) => {
    const questionController = container.resolve(QuestionsController);
    const session = useSession();
    const userId = session.data?.user?.id as string;
    const handleVote = async (isUpVote: boolean) => {
        await questionController.voteQuestion(question.id, userId, isUpVote);
    }
  return (
    <div>
        <div className="flex flex-col items-center justify-center px-4 py-6">
            <button onClick={() => handleVote(true)} className="p-1 rounded hover:bg-primary/10">
              <ArrowUpIcon className="w-6 h-6 text-primary" />
            </button>
            <span className="font-bold text-xl text-primary my-1">{question.upvotes ?? 0}</span>
            <button onClick={() => handleVote(false)} className="p-1 rounded hover:bg-primary/10">
              <ArrowDownIcon className="w-6 h-6 text-primary" />
            </button>
          </div>
    </div>
  )
}

export default VoteComponents
