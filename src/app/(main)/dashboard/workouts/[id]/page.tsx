"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { workoutsApi, healthApi } from "@/lib/api";
import { Dumbbell, Flame, CalendarDays, Loader2, Save, X, Plus, Edit2, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [estimatedCalories, setEstimatedCalories] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const res = await workoutsApi.getById(id);
      const data = res.data.data;
      setWorkout(data);
      setName(data.name);
      setEstimatedCalories(data.estimatedCalories ? String(data.estimatedCalories) : "");
      setExercises(data.exercises || []);
    } catch (err) {
      console.error("Failed to fetch workout:", err);
      setError("Workout not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const parsedExercises = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets ? Number(ex.sets) : null,
        reps: ex.reps ? Number(ex.reps) : null,
        duration: ex.duration || null,
        weight: ex.weight || null,
        distance: ex.distance || null
      }));

      const res = await workoutsApi.update(id, {
        name,
        estimatedCalories: estimatedCalories ? Number(estimatedCalories) : undefined,
        exercises: parsedExercises
      });
      
      setWorkout(res.data.data);
      setIsEditing(false);
      setSuccess("Workout updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update workout.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogToHealth = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const today = new Date().toISOString().split("T")[0];
      await healthApi.upsert({
        date: today,
        workoutId: id,
        caloriesBurned: estimatedCalories ? Number(estimatedCalories) : 0,
        source: "workout-log"
      });
      setSuccess("Successfully logged to today's Health!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to log to health.");
    } finally {
      setSaving(false);
    }
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const newEx = [...exercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setExercises(newEx);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", duration: "" }]);
  };

  const removeExercise = (index: number) => {
    const newEx = [...exercises];
    newEx.splice(index, 1);
    setExercises(newEx);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard/workouts" className="text-violet-600 hover:underline">
          Back to Workouts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/workouts" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Workout Details</h1>
            <p className="text-sm text-slate-500">View or edit your workout routine.</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Edit2 size={16} /> Edit
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 flex items-center justify-center gap-3 shadow-sm">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <X size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isEditing ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Workout Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Estimated Calories Burned (optional)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500" 
                value={estimatedCalories} 
                onChange={e => setEstimatedCalories(e.target.value)} 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Exercises</h3>
              <button 
                onClick={addExercise}
                className="text-sm text-violet-600 font-semibold flex items-center gap-1 hover:text-violet-700"
              >
                <Plus size={16} /> Add Exercise
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                  <button 
                    onClick={() => removeExercise(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm"
                  >
                    <X size={12} />
                  </button>
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-semibold text-slate-500 block">Exercise Name</label>
                    <input 
                      type="text" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.name} 
                      onChange={e => updateExercise(i, "name", e.target.value)} 
                    />
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="text-[10px] font-semibold text-slate-500 block">Sets</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.sets} 
                      onChange={e => updateExercise(i, "sets", e.target.value)} 
                    />
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="text-[10px] font-semibold text-slate-500 block">Reps</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.reps} 
                      onChange={e => updateExercise(i, "reps", e.target.value)} 
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="text-[10px] font-semibold text-slate-500 block">Time/Dur.</label>
                    <input 
                      type="text" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.duration || ""} 
                      onChange={e => updateExercise(i, "duration", e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => { setIsEditing(false); fetchWorkout(); }}
              className="flex-1 py-3 rounded-xl text-slate-700 font-semibold bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Dumbbell size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">{workout.name}</h2>
              <div className="flex flex-wrap items-center gap-6 mt-4 opacity-90 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} />
                  <span>Created {new Date(workout.createdAt).toLocaleDateString()}</span>
                </div>
                {workout.estimatedCalories && (
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-orange-300" />
                    <span>{workout.estimatedCalories} kcal estimated</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Dumbbell size={18} />
                  <span>{workout.exercises?.length || 0} exercises</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Exercise Routine</h3>
            {workout.exercises && workout.exercises.length > 0 ? (
              <div className="space-y-3">
                {workout.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-lg">{ex.name}</h4>
                      <div className="flex gap-4 mt-1">
                        {ex.sets && <span className="text-sm text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">{ex.sets} sets</span>}
                        {ex.reps && <span className="text-sm text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">{ex.reps} reps</span>}
                        {ex.weight && <span className="text-sm text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">{ex.weight}</span>}
                        {ex.duration && <span className="text-sm text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">{ex.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No exercises recorded.</p>
            )}
          </div>

          <button
            onClick={handleLogToHealth}
            disabled={saving}
            className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            Log Workout to Today's Health
          </button>
        </div>
      )}
    </div>
  );
}
