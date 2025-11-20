"use client";
import React from "react";

const funSteps = [
  { key: "payment", label: "Processing payment...", emoji: "💳" },
  { key: "ride", label: "Reserving your ride...", emoji: "🚗" },
  { key: "rooms", label: "Setting up your rooms...", emoji: "🛏️" },
  { key: "done", label: "All set! Enjoy your trip!", emoji: "🎉" },
];

export default function BookingProgressDialog({ step, visible }: { step: string; visible: boolean }) {
  if (!visible) return null;
  const currentStep = funSteps.find(s => s.key === step) || funSteps[0];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[320px] max-w-[90vw]">
        <div className="text-5xl animate-bounce">{currentStep.emoji}</div>
        <div className="text-xl font-bold animate-pulse text-primary">{currentStep.label}</div>
        <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
          <div className="h-2 bg-primary animate-booking-progress" style={{ width: `${(funSteps.findIndex(s => s.key === step) + 1) / funSteps.length * 100}%` }} />
        </div>
      </div>
      <style jsx>{`
        @keyframes booking-progress {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-booking-progress {
          animation: booking-progress 1.2s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}
