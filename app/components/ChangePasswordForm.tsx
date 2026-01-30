"use client";

import { useState } from "react";
import { changePassword } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export function ChangePasswordForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      await changePassword(formData);
      setSuccess(true);
      e.currentTarget.reset();
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Password changed successfully! Redirecting...
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Changing Password..." : "Change Password"}
      </button>
    </form>
  );
}
