import React, { Suspense } from 'react';
import AddQuestionComponent from './addQuestionComponent';
import { container } from 'tsyringe';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';
import { Question } from '@/app/(model)/questions/questionsModel';
import Link from 'next/link';


function QuestionsList({ questions }: { questions: Question[] }) {
  return (
    <div className='flex flex-col gap-4'>
      {questions.map((question: Question) => (
        <Link key={question.id} href={`/questions/${question.id}`}>
          <div className="card flex min-h-20 items-center gap-4 shadow-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface">
            <img
              src={question.user.mediaUrls[0]}
              alt="avatar"
              className="h-14 w-14 rounded-full object-cover object-center border-2 border-primary"
            />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-lg text-light-on-surface dark:text-dark-on-surface">{question.user.username}</span>
                <span className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">{new Date(question.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <span className="mt-2 text-body-md text-light-on-surface dark:text-dark-on-surface">
                {question.title}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function QuestionsSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card m-8 p-6 flex items-center gap-4 animate-pulse bg-gray-100 dark:bg-gray-800">
          <div className="h-14 w-14 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded mt-2" />
          </div>
        </div>
      ))}
    </>
  );
}

async function QuestionsContent() {
  try {
    const questionsController = container.resolve(QuestionsController);
    const questions: Question[] = await questionsController.getAllQuestions();
    return <QuestionsList questions={questions} />;
  } catch {
    return (
      <div className="card text-center text-red-600 bg-red-50 dark:bg-red-900/20">
        Failed to load questions. Please try again later.
      </div>
    );
  }
}

const page = async () => {
  return (
      <div className="flex flex-col items-center justify-start">
      <div className="w-full">
        <AddQuestionComponent />
        <div className="overflow-x-auto relative py-2">
          {/* Gradient fade left */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8 z-10 bg-gradient-to-r from-light-background/90 dark:from-dark-background/90 to-transparent" />
          {/* Gradient fade right */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 z-10 bg-gradient-to-l from-light-background/90 dark:from-dark-background/90 to-transparent" />
          <div
            className="flex gap-4 px-4 whitespace-nowrap scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent hide-scrollbar"
            aria-label="Question categories"
          >
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Islamabad
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Lahore
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Karachi
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Islamabad
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Lahore
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Karachi
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Islamabad
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Lahore
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Karachi
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Food
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Restaurants
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Hotels
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Attractions
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Events
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Transportation
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Shopping
            </div>
            <div className="card inline-block text-title-lg font-bold px-8 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none">
              Entertainment
            </div>
          </div>
        </div>
        <Suspense fallback={<QuestionsSkeleton />}>
          <QuestionsContent />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
