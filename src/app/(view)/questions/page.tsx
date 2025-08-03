import React, { Suspense } from 'react';
import AddQuestionComponent from './addQuestionComponent';
import { container } from 'tsyringe';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';
import { Question } from '@/app/(model)/questions/questionsModel';
import Link from 'next/link';
import { FaCity, FaUtensils, FaHotel, FaLandmark, FaCalendarAlt, FaBus, FaShoppingBag, FaFilm, FaMapMarkerAlt, FaStoreAlt } from 'react-icons/fa';


function QuestionsList({ questions }: { questions: Question[] }) {
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
    <div className="flex flex-col gap-6">
      {questions.map((question: Question) => (
        <Link key={question.id} href={`/questions/${question.id}`} className="no-underline">
          <div className="card group flex items-center gap-6 p-5 min-h-24 rounded-2xl shadow-lg border border-primary/10 dark:border-dark-outline/40 bg-white dark:bg-dark-surface transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
            <div className="flex-shrink-0">
              {question.user.mediaUrls && question.user.mediaUrls[0] ? (
                <img
                  src={question.user.mediaUrls[0]}
                  alt="avatar"
                  className="h-16 w-16 rounded-full object-cover object-center border-2 border-primary shadow"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary shadow">
                  {question.user.username ? question.user.username[0].toUpperCase() : '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-semibold text-lg text-primary group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors">
                  {question.user.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(question.createdAt)}
                </span>
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
            <div className="flex flex-col items-center justify-center gap-2 px-2 min-w-[80px]">
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
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-light-background dark:bg-dark-background">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 pt-4">
        {/* Sidebar for categories (desktop only) */}
        <aside className="hidden md:block md:w-72 flex-shrink-0">
          <div className="sticky top-8">
            <div className="card border border-primary/20 dark:border-dark-outline/40 rounded-2xl bg-white dark:bg-dark-surface p-4">
              <h2 className="text-lg font-bold mb-4 text-primary">Categories</h2>
              <div className="flex flex-col gap-2">
                {[
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
                ].map((cat, idx) => (
                  <div key={idx} className="card flex items-center text-title-md font-bold px-5 py-2 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none bg-white dark:bg-dark-surface border border-primary/10 dark:border-dark-outline/40">
                    {cat.icon}
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 w-full max-w-3xl mx-auto">
          <AddQuestionComponent />
          {/* Mobile category selector */}
          <div className="md:hidden w-full mb-4">
            <div className="card border border-primary/20 dark:border-dark-outline/40 rounded-2xl bg-white dark:bg-dark-surface p-3">
              <h2 className="text-md font-bold mb-2 text-primary">Categories</h2>
              <div className="overflow-x-auto">
                <div className="flex gap-3 px-1 whitespace-nowrap scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent hide-scrollbar" aria-label="Question categories">
                  {[
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
                  ].map((cat, idx) => (
                    <div key={idx} className="card inline-flex items-center text-title-md font-bold px-5 py-2 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none bg-white dark:bg-dark-surface border border-primary/10 dark:border-dark-outline/40">
                      {cat.icon}
                      {cat.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Suspense fallback={<QuestionsSkeleton />}>
            <QuestionsContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default page;
