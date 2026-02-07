"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    // Check if new password is same as current
    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess("Password changed successfully!");
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Change Password
          </h1>
          <p className="text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-slideInLeft flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-slideInLeft flex items-start gap-3">
            <span className="text-xl">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-slideInLeft">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              required
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className="input-field"
              placeholder="Enter current password"
            />
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div
              className="animate-slideInLeft"
              style={{ animationDelay: "0.1s" }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className="input-field"
                placeholder="Enter new password"
              />
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                Minimum 6 characters
              </p>
            </div>

            <div
              className="animate-slideInLeft"
              style={{ animationDelay: "0.2s" }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="input-field"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div
            className="flex gap-4 animate-slideInLeft"
            style={{ animationDelay: "0.3s" }}
          >
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Changing Password...
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 glass-effect p-6 rounded-xl">
          <h3 className="font-semibold gradient-text mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Password Requirements:
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
              Minimum 6 characters long
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Must be different from your current password
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Use a strong, unique password
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
