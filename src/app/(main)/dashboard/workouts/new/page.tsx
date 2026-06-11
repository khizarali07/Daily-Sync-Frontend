"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { aiApi, workoutsApi } from '@/lib/api';
import {
  Camera, Dumbbell, Loader2, X, Plus, Save, Activity, Heart, Clock, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function NewWorkoutPage() {
  const router = useRouter();
  const [entryMode, setEntryMode] = useState<'manual' | 'image'>('manual');
  
  // Image State
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [estimatedCalories, setEstimatedCalories] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImage(base64);
      setPreview(base64);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError('');

    try {
      const res = await aiApi.analyzeWorkout(image);
      const data = res.data.data;
      
      setName(data.workoutType || 'AI Analyzed Workout');
      setEstimatedCalories(data.caloriesBurned ? String(data.caloriesBurned) : '');
      
      if (data.exercises && data.exercises.length > 0) {
        setExercises(data.exercises);
      }
      
      setEntryMode('manual');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', duration: '' }]);
  };

  const removeExercise = (index: number) => {
    const newEx = [...exercises];
    newEx.splice(index, 1);
    setExercises(newEx);
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const newEx = [...exercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setExercises(newEx);
  };

  const handleSave = async () => {
    if (!name) {
      setError('Workout name is required.');
      return;
    }

    if (exercises.length === 0) {
      setError('Please add at least one exercise.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Map properties to ensure they are valid
      const parsedExercises = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets ? Number(ex.sets) : null,
        reps: ex.reps ? Number(ex.reps) : null,
        duration: ex.duration || null,
        weight: ex.weight || null,
        distance: ex.distance || null
      }));

      await workoutsApi.create({
        name,
        estimatedCalories: estimatedCalories ? Number(estimatedCalories) : undefined,
        exercises: parsedExercises
      });
      
      router.push('/dashboard/workouts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save workout.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/workouts" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Workout</h1>
          <p className="text-sm text-slate-500">Add a new workout routine manually or from an image.</p>
        </div>
      </div>

      <div className="flex bg-slate-200/50 rounded-lg p-1 w-fit">
        <button
          onClick={() => setEntryMode('manual')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${entryMode === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setEntryMode('image')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${entryMode === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Upload Image (AI)
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">
          <X size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {entryMode === 'image' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {!preview ? (
            <label className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-xl hover:border-violet-400 hover:bg-violet-50/50 cursor-pointer transition-all">
              <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center mb-4">
                <Camera size={32} />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">Upload Workout Screenshot</p>
              <p className="text-sm text-slate-400">Click or drag to upload an image from your fitness app</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-xl bg-slate-50"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-lg flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing with Local AI...
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Extract Workout Data
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Workout Name</label>
              <input 
                type="text" 
                placeholder="e.g. Six Pack Abs, Heavy Leg Day" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Estimated Calories Burned (optional)</label>
              <input 
                type="number" 
                placeholder="e.g. 400" 
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
                      placeholder="e.g. Bench Press" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.name} 
                      onChange={e => updateExercise(i, 'name', e.target.value)} 
                    />
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="text-[10px] font-semibold text-slate-500 block">Sets</label>
                    <input 
                      type="number" 
                      placeholder="3" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.sets} 
                      onChange={e => updateExercise(i, 'sets', e.target.value)} 
                    />
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="text-[10px] font-semibold text-slate-500 block">Reps</label>
                    <input 
                      type="number" 
                      placeholder="10" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.reps} 
                      onChange={e => updateExercise(i, 'reps', e.target.value)} 
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="text-[10px] font-semibold text-slate-500 block">Time/Dur.</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 60s" 
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" 
                      value={ex.duration} 
                      onChange={e => updateExercise(i, 'duration', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
              
              {exercises.length === 0 && (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-sm">No exercises added yet.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-4"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Workout
          </button>
        </div>
      )}
    </div>
  );
}
