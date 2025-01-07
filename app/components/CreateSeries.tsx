'use client';

import { useState } from "react";
import { createSeries } from "@/lib/utils/createSeries";
import { useRouter } from "next/navigation";

export default function CreateSeries() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "duplicate" | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (name.trim()) {
      try {
        await createSeries(name); // Only creates the series
        setName("");
        setStatus("success");
      } catch (error: unknown) {
        if (error instanceof Error && error.message === "Series already exists") {
          setStatus("duplicate");
        } else {
          setStatus("error");
        }
      }
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="absolute top-40 flex flex-col items-center w-full"> {/* Moves the form up */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-6 mx-auto w-1/2"
      >
        <label
          htmlFor="series-name"
          className="create-post-label text-center font-bold !text-3xl"
        >
          Create A New Series:
        </label>
        <input
          id="series-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 text-lg border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter series name"
        />
        <div className="flex justify-center space-x-4 mt-6">
          <button
            type="submit"
            className="w-24 h-16 text-lg font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-24 h-16 text-lg font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500"
          >
            Close
          </button>
        </div>
  
        {/* Message Section */}
        <div className="mt-4">
          {status === "success" && <p className="text-green-500 text-lg">Series created successfully!</p>}
          {status === "duplicate" && <p className="text-yellow-500 text-lg">Series already exists!</p>}
          {status === "error" && <p className="text-red-500 text-lg">Failed to create series. Try again.</p>}
        </div>
      </form>
    </div>
  );
  
}
