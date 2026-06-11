"use client";

import { useEffect, useState } from "react";
import { Cpu, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface ProviderStatus {
  current: "local-gguf" | "gemini";
  lmstudio: {
    available: boolean;
    url: string;
  };
  gemini: {
    available: boolean;
    configured: boolean;
  };
}

export default function AIProviderSwitcher() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/api/ai-provider/status`);
      setStatus(response.data.data);
    } catch (error) {
      console.error("Failed to fetch AI provider status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const switchProvider = async (provider: "local-gguf" | "gemini") => {
    setLoading(true);
    setShowDropdown(false);
    try {
      const response = await api.post(`/api/ai-provider/switch`, {
        provider,
      });
      setStatus(response.data.data);
    } catch (error: any) {
      console.error("Failed to switch provider:", error);
      alert(error.response?.data?.error || "Failed to switch provider");
    } finally {
      setLoading(false);
    }
  };

  const currentProvider = status?.current || "gemini";
  const isLMStudio = currentProvider === "local-gguf";

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        {isLMStudio ? (
          <Cpu size={16} className="text-purple-500" />
        ) : (
          <Sparkles size={16} className="text-sky-500" />
        )}
        <span className="text-xs font-medium text-slate-700">
          {isLMStudio ? "Local AI" : "Gemini"}
        </span>
        {!loading && (
          <div
            className={`w-2 h-2 rounded-full ${
              status && ((isLMStudio && status.lmstudio.available) ||
              (!isLMStudio && status.gemini.available))
                ? "bg-emerald-400"
                : "bg-amber-400"
            }`}
          />
        )}
        {loading && (
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                AI Provider
              </p>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => switchProvider("local-gguf")}
                disabled={!status || !status.lmstudio.available || loading}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  currentProvider === "local-gguf"
                    ? "bg-purple-50 border border-purple-200"
                    : "hover:bg-slate-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Cpu
                  size={20}
                  className={
                    currentProvider === "local-gguf"
                      ? "text-purple-500"
                      : "text-slate-400"
                  }
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">
                    Local GGUF Model
                  </p>
                  <p className="text-xs text-slate-500">
                    {!status ? "Checking..." : status.lmstudio.available
                      ? "Ready"
                      : "Not available"}
                  </p>
                </div>
                {currentProvider === "local-gguf" && (
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>

              {/* Gemini Option */}
              <button
                onClick={() => switchProvider("gemini")}
                disabled={!status || !status.gemini.configured || loading}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  currentProvider === "gemini"
                    ? "bg-sky-50 border border-sky-200"
                    : "hover:bg-slate-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Sparkles
                  size={20}
                  className={
                    currentProvider === "gemini"
                      ? "text-sky-500"
                      : "text-slate-400"
                  }
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">
                    Google Gemini
                  </p>
                  <p className="text-xs text-slate-500">
                    {!status ? "Checking..." : status.gemini.configured
                      ? "Ready"
                      : "API key not configured"}
                  </p>
                </div>
                {currentProvider === "gemini" && (
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                )}
              </button>
            </div>
            <div className="p-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Switch between local LM Studio and cloud-based Gemini AI for
                analysis
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
