"use client";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-900">
        Something went wrong!
      </h2>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-black/90"
      >
        Try again
      </button>
    </div>
  );
}
