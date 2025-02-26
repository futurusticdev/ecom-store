"use client";

import React from "react";

interface Step {
  id: number;
  name: string;
}

interface StepsIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepsIndicator({
  steps,
  currentStep,
}: StepsIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full min-w-[320px]">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center relative">
          <div
            className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full shrink-0 ${
              step.id === currentStep
                ? "bg-black text-white"
                : step.id < currentStep
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <span className="text-xs sm:text-sm">
              {step.id < currentStep ? "✓" : step.id}
            </span>
          </div>
          <span
            className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${
              step.id === currentStep ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {step.name}
          </span>
          {index < steps.length - 1 && (
            <div className="mx-1 sm:mx-2 h-[1px] w-8 sm:w-16 md:w-24 bg-gray-200 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
