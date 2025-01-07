'use client';

import { useState } from 'react';
import { createSeries } from '@/lib/utils/createSeries';
import { useRouter } from 'next/navigation';

export default function CreateSeries() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<
    'success' | 'error' | 'duplicate' | null
  >(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (name.trim()) {
      try {
        await createSeries(name); // Only creates the series
        setName('');
        setStatus('success');
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message === 'Series already exists'
        ) {
          setStatus('duplicate');
        } else {
          setStatus('error');
        }
      }
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="absolute top-40 flex w-full flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-1/2 flex-col items-center space-y-6"
      >
        <label
          htmlFor="series-name"
          className="create-post-label text-center !text-3xl font-bold"
        >
          Create A New Series:
        </label>
        <input
          id="series-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-4 text-lg text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter series name"
        />
        <div className="mt-6 flex justify-center space-x-4">
          <button
            type="submit"
            className="h-16 w-24 rounded-lg bg-emerald-500 text-lg font-bold text-white hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="h-16 w-24 rounded-lg bg-red-500 text-lg font-bold text-white hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500"
          >
            Close
          </button>
        </div>

        {/* Message Section */}
        <div className="mt-4">
          {status === 'success' && (
            <p className="text-lg text-green-500">
              Series created successfully!
            </p>
          )}
          {status === 'duplicate' && (
            <p className="text-lg text-yellow-500">Series already exists!</p>
          )}
          {status === 'error' && (
            <p className="text-lg text-red-500">
              Failed to create series. Try again.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
