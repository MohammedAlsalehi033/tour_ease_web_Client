"use client";
import React, { useState } from 'react';
import { container } from '@/app/lib/diContainer';
import { TripPlannerController } from '@/app/(controller)/tripPlanner/tripPlannerController';
import type { TripPlannerSearchParams } from '@/app/(model)/tripPlanner/tripPlannerModel';

interface RefinePlanChatProps {
  originalRequest: TripPlannerSearchParams;
  currentResults: any;
  onRefinedResults: (results: any) => void;
}

export const RefinePlanChat: React.FC<RefinePlanChatProps> = ({
  originalRequest,
  currentResults,
  onRefinedResults
}) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { 
      role: 'assistant', 
      content: 'Hi! I can help you refine your trip plan. What would you like to adjust? (e.g., "Show me cheaper options", "I prefer luxury accommodations", "Add more activities")' 
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const tripPlannerController = container.resolve(TripPlannerController);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message to chat
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    
    setLoading(true);

    try {
      const refineResponse = await tripPlannerController.refineTripPlans({
        originalRequest,
        currentResults,
        userMessage,
        conversationHistory: updatedMessages
      });

      // Add AI response to chat
      setMessages([
        ...updatedMessages,
        { 
          role: 'assistant', 
          content: refineResponse.aiExplanation + '\n\n' + refineResponse.changesMade.join(', ')
        }
      ]);

      // Update results with refined plans
      onRefinedResults({
        success: true,
        data: refineResponse.refinedPlans
      });

    } catch (error) {
      console.error('Refine error:', error);
      setMessages([
        ...updatedMessages,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while refining your plan. Please try again.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <span className="text-2xl">🤖</span>
        <h3 className="text-lg font-semibold">AI Trip Assistant</h3>
      </div>

      {/* Chat Messages */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-pulse">💭</div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your request here..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !userInput.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setUserInput('Show me cheaper options')}
          className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
          disabled={loading}
        >
          Cheaper options
        </button>
        <button
          onClick={() => setUserInput('I prefer luxury accommodations')}
          className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
          disabled={loading}
        >
          Luxury stays
        </button>
        <button
          onClick={() => setUserInput('Show me faster transport options')}
          className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
          disabled={loading}
        >
          Faster transport
        </button>
        <button
          onClick={() => setUserInput('Add more family-friendly activities')}
          className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
          disabled={loading}
        >
          Family activities
        </button>
      </div>
    </div>
  );
};
