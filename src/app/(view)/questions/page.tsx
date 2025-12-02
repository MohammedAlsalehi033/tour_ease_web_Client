import React, { Suspense } from 'react';
import OtherAvatarPic from '../components/otherAvatarPic';
import AddQuestionComponent from './addQuestionComponent';
import QuestionsPageWrapper from './QuestionsPageWrapper';
import { container } from 'tsyringe';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';
import { Question } from '@/app/(model)/questions/questionsModel';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReportQuestionButton from '../components/ReportQuestionButton';
// Added FaQuestionCircle for the header
import { FaCity, FaUtensils, FaHotel, FaLandmark, FaCalendarAlt, FaBus, FaShoppingBag, FaFilm, FaMapMarkerAlt, FaStoreAlt, FaQuestionCircle } from 'react-icons/fa';

// This component remains unchanged
function QuestionsList({ questions, currentUserId }: { questions: Question[], currentUserId?: string }) {
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
    <div className="flex flex-col gap-4 sm:gap-6">
      {questions.map((question: Question) => (
        <Link key={question.id} href={`/questions/${question.id}`} className="no-underline">
          <div className="card group flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-5 min-h-24 rounded-2xl shadow-lg border border-primary/10 dark:border-dark-outline/40 bg-white dark:bg-dark-surface transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
            <div className="flex-shrink-0">
              <OtherAvatarPic
                imageUrl={question.user.mediaUrls && question.user.mediaUrls[0]}
                otherUserId={question.user.id}
                userName={question.user.username}
              />
            </div>
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-semibold text-lg text-primary group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors">
                  {question.user.username}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {timeAgo(question.createdAt)}
                  </span>
                  <ReportQuestionButton 
                    questionId={question.id.toString()}
                    questionTitle={question.title}
                    currentUserId={currentUserId}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <div className="mt-2">
                <span className="block text-title-md font-bold text-dark-on-surface dark:text-light-on-surface mb-1">
                  {question.title}
                </span>
                {question.description && (
                  <span className="block text-body-md text-gray-700 dark:text-gray-300 line-clamp-2">
                    {question.description}
                  </span>
                )}
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
            <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 w-full sm:w-auto sm:min-w-[80px] mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 font-bold bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-1">▲ {question.upvotes ?? 0}</span>
                <span className="text-xs text-red-600 font-bold bg-red-100 dark:bg-red-900/30 rounded-full px-2 py-1">▼ {question.downvotes ?? 0}</span>
              </div>
              <span className="text-xs text-primary font-semibold bg-primary/10 rounded-full px-2 py-1">{question._count?.comments ?? 0} comments</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// This component remains unchanged
function QuestionsSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-4 sm:gap-6 animate-pulse bg-gray-100 dark:bg-dark-surface-container rounded-2xl">
          <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-3 w-full sm:w-auto">
            <div className="flex justify-between items-center">
              <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-3 w-1/5 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
          <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-600 flex sm:flex-col gap-2">
             <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
             <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// This component remains unchanged
async function QuestionsContent() {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const currentUserId = (session?.user as { id?: string })?.id;
    
    const questionsController = container.resolve(QuestionsController);
    const questions: Question[] = await questionsController.getAllQuestions();
    return <QuestionsList questions={questions} currentUserId={currentUserId} />;
  } catch {
    return (
      <div className="card text-center text-red-600 bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl">
        Failed to load questions. Please try again later.
      </div>
    );
  }
}

// Main page component is REFACTORED
const page = async () => {

  // Define categories here to avoid repetition
  const categories = [
    { name: 'Islamabad', icon: <FaMapMarkerAlt className="mr-2 text-primary" /> },
    { name: 'Lahore', icon: <FaCity className="mr-2 text-primary" /> },
    { name: 'Karachi', icon: <FaCity className="mr-2 text-primary" /> },
    { name: 'Food', icon: <FaUtensils className="mr-2 text-primary" /> },
    { name: 'Restaurants', icon: <FaStoreAlt className="mr-2 text-primary" /> },
    { name: 'Hotels', icon: <FaHotel className="mr-2 text-primary" /> },
    { name: 'Attractions', icon: <FaLandmark className="mr-2 text-primary" /> },
    { name: 'Events', icon: <FaCalendarAlt className="mr-2 text-primary" /> },
    { name: 'Transportation', icon: <FaBus className="mr-2 text-primary" /> },
    { name: 'Shopping', icon: <FaShoppingBag className="mr-2 text-primary" /> },
    { name: 'Entertainment', icon: <FaFilm className="mr-2 text-primary" /> },
  ];

  return (
    <QuestionsPageWrapper
      categories={categories}
      questionsListComponent={
        <Suspense fallback={<QuestionsSkeleton />}>
          <QuestionsContent />
        </Suspense>
      }
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
            <FaQuestionCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
              Community Q&A
            </h1>
            <p className="font-sans text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Ask questions and share travel advice with others
            </p>
          </div>
        </div>
      </div>

      <div className="my-6">
        <AddQuestionComponent />
      </div>
    </QuestionsPageWrapper>
  );
};

export default page;