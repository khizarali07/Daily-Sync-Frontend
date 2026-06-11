"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { workoutsApi } from "@/lib/api";
import { Plus, Dumbbell, Flame, Clock, CalendarDays, ChevronRight, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await workoutsApi.getAll();
      setWorkouts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      await workoutsApi.delete(id);
      fetchWorkouts();
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Workouts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your AI-analyzed and manual workouts.
          </p>
        </div>
        <Link
          href="/dashboard/workouts/new"
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>New Workout</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Workouts Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            You haven't created any workouts. Create one manually or upload an image to use AI analysis.
          </p>
          <Link
            href="/dashboard/workouts/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-50 text-violet-600 font-semibold rounded-xl hover:bg-violet-100 transition-colors"
          >
            <Plus size={20} />
            Create First Workout
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/dashboard/workouts/${workout.id}`}
              className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10 transition-all block relative"
            >
              <button
                onClick={(e) => handleDelete(e, workout.id)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
              >
                <Trash2 size={18} />
              </button>

              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-50 text-violet-600 rounded-xl flex items-center justify-center mb-4">
                <Dumbbell size={24} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{workout.name}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {new Date(workout.createdAt).toLocaleDateString()}
                </div>
                {workout.estimatedCalories && (
                  <div className="flex items-center gap-1.5 text-orange-600">
                    <Flame size={14} />
                    {workout.estimatedCalories} kcal
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  {workout.exercises?.length || 0} exercises
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
