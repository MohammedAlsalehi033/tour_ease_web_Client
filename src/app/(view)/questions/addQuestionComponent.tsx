'use client'
import { QuestionsController } from '@/app/(controller)/questions/questionsController';
import { container } from '@/app/lib/diContainer';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { Question } from '@/app/(model)/questions/questionsModel';
const AddQuestionComponent = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    const questionsController = await container.resolve(QuestionsController);
    try {
      await questionsController.addQuestion(
        {
          title,
          description: desc,
          userId: session?.user?.email ?? '', // fallback to email
          upvotes: 0,
          downvotes: 0,
          tags: [],
          user: {
            id: '',
            username: '',
            mediaUrls: []
          },
          vote: [],
          _count: {
            comments: 0
          }
        }
      );
      setSuccess(true);
      setTitle('');
      setDesc('');
      setShowForm(false);
      window.location.reload();

   

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiQuestion = async () => {
    setLoading(true);
    setSuccess(false);
    const questionsController = await container.resolve(QuestionsController);
    try {
      const responseRaw = await questionsController.askAI({
        title,
        description: desc,
        userId: session?.user?.email ?? '', // fallback to email
        upvotes: 0,
        downvotes: 0,
        tags: [],
        user: {
          id: '',
          username: '',
          mediaUrls: []
        },
        vote: [],
        _count: {
          comments: 0
        },
        id: 0,
        updatedAt: '',
        createdAt: ''
      });
      let response;
      if (typeof responseRaw === 'string') {
        try {
          response = JSON.parse(responseRaw);
        } catch {
          response = null;
        }
      } else {
        response = responseRaw;
      }
      if (response?.success && response?.data) {
        setAiResponse(response.data);
      } else if (response?.title && response?.introduction) {
        setAiResponse(response);
      } else {
        setAiResponse({ title: 'Error', introduction: 'No valid response from AI.' });
      }
    } catch (error) {
      console.error(error);
      setAiResponse({ title: 'Error', introduction: 'Failed to get AI response.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* AI Response Modal */}
      {aiResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
          <div className="max-w-2xl w-full bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-0 relative flex flex-col items-center" style={{ maxHeight: '90vh' }}>
            <div className="w-full overflow-y-auto p-8" style={{ maxHeight: '80vh' }}>
              <h2 className="text-2xl font-bold mb-4 text-primary text-center">{aiResponse.title}</h2>
              <p className="text-md mb-6 text-center text-gray-700 dark:text-gray-200">{aiResponse.introduction}</p>
              {Array.isArray(aiResponse.sections) && aiResponse.sections.length > 0 && (
                <div className="w-full flex flex-col gap-4 mb-4">
                  {aiResponse.sections.map((section: any, idx: number) => (
                    <div key={idx} className="bg-primary/10 dark:bg-dark-outline/10 rounded-xl p-4 shadow">
                      <h3 className="text-lg font-semibold text-primary mb-2">{section.cardTitle}</h3>
                      <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{section.cardContent}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-full flex justify-center p-4 border-t border-gray-200 dark:border-dark-outline bg-white dark:bg-dark-surface rounded-b-2xl">
              <button
                className="btn btn-primary px-6 py-2 rounded-xl font-semibold shadow"
                onClick={() => setAiResponse(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        className="btn btn-primary w-full text-title-md font-bold shadow mb-4 transition-transform active:scale-95"
        onClick={() => setShowForm((v) => !v)}
        aria-expanded={showForm}
        aria-controls="add-question-form"
      >
        {showForm ? 'Close' : 'Add Question'}
      </button>
      {showForm && (
        <form
          id="add-question-form"
          onSubmit={handleSubmit}
          className="card flex flex-col gap-5 animate-fadeIn border border-primary/20 dark:border-dark-outline/40 shadow-lg rounded-2xl p-8 bg-white dark:bg-dark-surface/80 transition-all duration-300"
          autoComplete="off"
        >
          <input
            className="input border-primary dark:border-dark-outline border-2 focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 py-3 text-title-md transition-all duration-200"
            type="text"
            placeholder="Question Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
          <div className="divider" />
          <textarea
            className="input resize-none min-h-[96px] border-primary dark:border-dark-outline border-2 focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 py-3 text-body-md transition-all duration-200"
            placeholder="Question Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
            rows={4}
            maxLength={1000}
          />
          <button
            type="submit"
            className="btn btn-primary flex items-center justify-center gap-2 font-semibold text-title-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2 transition-transform active:scale-95 shadow"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            {loading ? 'Submitting...' : 'Submit Question'}
          </button>
          <button
            type="button"
            className="btn btn-primary flex items-center justify-center gap-2 font-semibold text-title-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2 transition-transform active:scale-95 shadow"
            disabled={loading}
            onClick={handleAiQuestion}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            {loading ? 'Waiting for response...' : 'Ask AI'}
          </button>
        </form>
      )}
      {success && (
        <div className="text-success text-center mt-3 font-semibold bg-success/10 dark:bg-success/20 rounded-xl py-3 px-4 shadow animate-fadeIn">
          Question submitted!
        </div>
      )}
    </div>
  );
};

export default AddQuestionComponent;
