'use client'
import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const AddQuestionComponent = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTitle('');
      setDesc('');
      setShowForm(false);
      setTimeout(() => setSuccess(false), 2000);
    }, 1200);
  };

  return (
    <div className="w-full">
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
