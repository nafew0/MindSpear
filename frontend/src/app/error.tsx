'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
  }, [error]);

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm opacity-80">
          {process.env.NODE_ENV === 'development' ? error.message : 'Please try again.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg border"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
