"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">D</span>
            </div>
            <span className="text-2xl font-bold gradient-text">DailySync</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-6 py-2.5 text-slate-700 font-semibold rounded-lg hover:bg-white/50 transition-all duration-300"
            >
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500/10 to-purple-500/10 rounded-full border border-sky-200 animate-scale-in">
            <span className="text-sm font-semibold gradient-text">
              ✨ Your AI-Powered Life Assistant
            </span>
          </div>

          <h1 className="text-7xl md:text-8xl font-extrabold text-slate-900 leading-tight">
            Master Your
            <span className="block gradient-text mt-2">Daily Routine</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transform your daily life with intelligent scheduling, AI-driven
            insights, and comprehensive health tracking. Your personal operating
            system for success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/register"
              className="btn-primary text-lg px-10 py-4 animate-glow"
            >
              Start Free Today
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-10 py-4">
              Explore Features
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xl">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xl">✓</span>
              <span>Free forever plan</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Preview */}
        <div className="mt-20 animate-slide-right">
          <div className="glass-effect rounded-3xl p-2 shadow-2xl max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-lg p-4 border border-sky-400/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm font-mono">
                      Task completed: Morning Workout ✓
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-400/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <span className="text-sm font-mono">
                      AI Insight: Great progress this week! 🎉
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-lg p-4 border border-pink-400/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"
                      style={{ animationDelay: "2s" }}
                    ></div>
                    <span className="text-sm font-mono">
                      Health sync: 8,432 steps today 💪
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        id="features"
        className="relative z-10 bg-white/50 backdrop-blur-sm py-24"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you stay organized, motivated,
              and healthy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card group hover:scale-105 animate-slide-left">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Smart Scheduling
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Create recurring task templates and manage your daily schedule
                with intelligent automation
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-sky-500">✓</span> CSV import for quick
                  setup
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-500">✓</span> Recurring task
                  templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-500">✓</span> Weekly view &
                  analytics
                </li>
              </ul>
            </div>

            <div
              className="card group hover:scale-105 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                AI Insights
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Get personalized diary entries and accountability feedback from
                your AI companion
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span> Daily summary
                  generation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span> Progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span> Motivational
                  feedback
                </li>
              </ul>
            </div>

            <div className="card group hover:scale-105 animate-slide-right">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">💪</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Health Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Comprehensive health monitoring with wearable integration and AI
                analysis
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Smartwatch sync
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Food & workout
                  tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Vision AI analysis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="glass-effect rounded-3xl p-12 text-center max-w-4xl mx-auto shadow-2xl">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of people who have already taken control of their
              daily routine
            </p>
            <Link
              href="/register"
              className="btn-primary text-lg px-12 py-4 inline-block animate-glow"
            >
              Get Started for Free →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">D</span>
              </div>
              <span className="text-xl font-bold">DailySync</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 DailySync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
