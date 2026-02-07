'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { tasksApi, healthApi, aiApi } from '@/lib/api';
import {
  CalendarDays, ListTodo, Camera, Heart, BarChart3, BookOpen,
  CheckCircle2, Clock, TrendingUp, Flame, ArrowRight
} from 'lucide-react';

interface TaskSummary {
  total: number;
  completed: number;
  pending: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const tasksRes = await tasksApi.getToday();
      const tasks = tasksRes.data.tasks || [];
      setTaskSummary({
        total: tasks.length,
        completed: tasks.filter((t: any) => t.isCompleted).length,
        pending: tasks.filter((t: any) => !t.isCompleted).length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const completionRate = taskSummary.total > 0
    ? Math.round((taskSummary.completed / taskSummary.total) * 100)
    : 0;

  const quickActions = [
    { href: '/dashboard/today', label: "Today's Tasks", icon: ListTodo, color: 'from-sky-500 to-blue-600', description: 'View and complete daily tasks' },
    { href: '/dashboard/schedule', label: 'Master Schedule', icon: CalendarDays, color: 'from-violet-500 to-purple-600', description: 'Manage task templates' },
    { href: '/dashboard/ai-analysis', label: 'AI Analysis', icon: Camera, color: 'from-amber-500 to-orange-600', description: 'Analyze food & workouts' },
    { href: '/dashboard/health', label: 'Health Tracking', icon: Heart, color: 'from-rose-500 to-pink-600', description: 'Log health metrics' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, color: 'from-emerald-500 to-green-600', description: 'View consistency trends' },
    { href: '/dashboard/journal', label: 'AI Journal', icon: BookOpen, color: 'from-indigo-500 to-blue-600', description: 'AI diary & reflections' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-sky-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sky-100 text-sm font-medium mb-1">{greeting()}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{user?.name} 👋</h1>
            <p className="text-sky-100 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <Link
            href="/dashboard/today"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all"
          >
            View Today
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <ListTodo size={20} className="text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">Today</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '...' : taskSummary.total}</p>
          <p className="text-sm text-slate-500 mt-1">Total Tasks</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Done</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '...' : taskSummary.completed}</p>
          <p className="text-sm text-slate-500 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Pending</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '...' : taskSummary.pending}</p>
          <p className="text-sm text-slate-500 mt-1">Remaining</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Rate</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '...' : `${completionRate}%`}</p>
          <p className="text-sm text-slate-500 mt-1">Completion</p>
        </div>
      </div>

      {/* Progress Bar */}
      {!loading && taskSummary.total > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Today&apos;s Progress</p>
            <p className="text-sm font-bold text-slate-900">{completionRate}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-purple-600 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{action.label}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
                <div className="flex items-center gap-1 mt-3 text-sm font-medium text-sky-600 group-hover:text-sky-700">
                  Open
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
