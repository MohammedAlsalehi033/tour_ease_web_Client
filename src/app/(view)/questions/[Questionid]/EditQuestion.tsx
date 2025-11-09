"use client";
import "reflect-metadata"
import React, { useState, FormEvent } from 'react';
import { FaEdit } from 'react-icons/fa';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { QuestionsController } from "@/app/(controller)/questions/questionsController";
import { container } from '@/app/lib/diContainer';
import { set } from 'firebase/database';
import { useRouter } from "next/navigation";

interface EditQuestionProps {
  questionId: string; 
  currentTitle: string;
  currentDescription: string;
  isDisabled?: boolean;
}

const EditQuestion: React.FC<EditQuestionProps> = ({ questionId, currentTitle, currentDescription, isDisabled = true }) => {
  // State to control the modal's visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State to hold the form input values
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);

  const handleSave = (e: FormEvent) => {
    e.preventDefault(); 
    try{
      setIsLoading(true);
      const questionsController = container.resolve(QuestionsController);
      questionsController.editQuestion(parseInt(questionId), title, description)
      window.location.reload();
      alert("question edited successfully")
    }
    catch{
      alert("something went wrong try again")
    }
    finally{
setIsLoading(false);
setIsModalOpen(false)
    }
  };

const router = useRouter();
  const handelDelete = () => {
    try{
      setIsLoading(true);
      const questionsController = container.resolve(QuestionsController);
      questionsController.deleteQuestion(questionId)
      alert("question deleted successfully")
      router.push("/questions");
    }
    catch{
      alert("something went wrong try again")
    }
    finally{
setIsLoading(false);
setIsModalOpen(false)

    }
  };
  

  return (
    <>
      {/* The button that triggers the modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-primary flex items-center gap-2"
        disabled={isDisabled} // Use your existing button style
        aria-label="Edit Question"
      >
        <FaEdit />
        <span>Edit</span>
      </button>

      {/* --- The Modal --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="relative w-full max-w-2xl bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl border border-primary/20 dark:border-dark-outline/40 mx-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/10 dark:border-dark-outline/30">
              <h3 className="text-xl font-semibold text-dark-on-surface dark:text-light-on-surface">
                Edit Question
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-surface-variant focus:outline-none"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body with the Form */}
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-6">
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block mb-2 text-sm font-medium text-dark-on-surface dark:text-light-on-surface">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-white/50 dark:bg-black/20 border border-dark-outline/30 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder={currentTitle}
                    required
                  />
                </div>
                {/* Description Input */}
                <div>
                  <label htmlFor="description" className="block mb-2 text-sm font-medium text-dark-on-surface dark:text-light-on-surface">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-white/50 dark:bg-black/20 border border-dark-outline/30 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder={currentDescription}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end p-5 space-x-4 border-t border-primary/10 dark:border-dark-outline/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary" 
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary" 
                                    disabled={isLoading}

                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handelDelete}

                                    disabled={isLoading}

                >
                  delete question
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

export default EditQuestion;