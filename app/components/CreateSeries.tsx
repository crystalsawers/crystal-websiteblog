'use client';

import { useState } from "react";
import { createSeries } from "@/lib/utils/createSeries";

export default function CreateSeries() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "duplicate" | null>(null);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
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
    <div className="space-y-6 flex flex-col items-center">
      <label htmlFor="series-name" className="create-post-label">
        New Series Name:
      </label>
      <input
        id="series-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="create-post-input w-1/2"
        placeholder="Enter new series name"
      />
      <button
        type="button" // This prevents the form from submitting
        onClick={handleSubmit}
        className="w-1/2 rounded-md bg-emerald-500 py-3 text-white font-semibold hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        Create New Series
      </button>
      {status === "success" && <p className="text-green-500 mt-2">Series created successfully!</p>}
      {status === "duplicate" && <p className="text-yellow-500 mt-2">Series already exists!</p>}
      {status === "error" && <p className="text-red-500 mt-2">Failed to create series. Please try again.</p>}
    </div>
  );
}
