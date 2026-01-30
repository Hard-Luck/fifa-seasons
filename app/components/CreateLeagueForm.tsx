"use client";

import { useState } from "react";
import { createLeague } from "@/app/actions/leagues";
import { useRouter } from "next/navigation";

interface CreateLeagueFormProps {
  currentUserId: string;
  users: Array<{ id: string; name: string }>;
}

export function CreateLeagueForm({
  currentUserId,
  users,
}: CreateLeagueFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otherUsers = users.filter((u) => u.id !== currentUserId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createLeague(formData);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create New League
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="footballLeague"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Football League
        </label>
        <select
          id="footballLeague"
          name="footballLeague"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="EPL">Premier League (EPL)</option>
          <option value="championship">Championship</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="totalGames"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Total Games
        </label>
        <input
          type="number"
          id="totalGames"
          name="totalGames"
          min="1"
          max="100"
          defaultValue={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label
          htmlFor="opponentId"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Opponent
        </label>
        <select
          id="opponentId"
          name="opponentId"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Select opponent...</option>
          {otherUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create League"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
