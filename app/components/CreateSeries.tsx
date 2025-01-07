'use client';

import { useState } from "react";
import { createSeries } from "@/lib/utils/createSeries";

export default function CreateSeries() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "duplicate" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (name.trim()) {
      try {
        await createSeries(name);
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center space-y-4 mx-auto w-1/3"
    >
      <label htmlFor="series-name" className="create-post-label text-center">
        Create A New Series:
      </label>
      <input
        id="series-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
        placeholder="Series name"
      />
      <button
        type="submit"
        className="w-full px-3 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        Create
      </button>
      {status === "success" && <p className="text-green-500 text-sm">Series created successfully!</p>}
      {status === "duplicate" && <p className="text-yellow-500 text-sm">Series already exists!</p>}
      {status === "error" && <p className="text-red-500 text-sm">Failed to create series. Try again.</p>}
    </form>
  );
}
