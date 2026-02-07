'use client';

import { useState, useRef } from 'react';
import { aiApi } from '@/lib/api';
import {
  Camera, UtensilsCrossed, Dumbbell, Upload, Loader2,
  Flame, Beef, Wheat, Droplets, X, Image as ImageIcon
} from 'lucide-react';

type AnalysisType = 'food' | 'workout';

export default function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState<AnalysisType>('food');
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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
      setResult(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = activeTab === 'food'
        ? await aiApi.analyzeFood(image)
        : await aiApi.analyzeWorkout(image);
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyze food photos and workout screenshots with Gemini AI
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 flex gap-1">
        <button
          onClick={() => { setActiveTab('food'); clearImage(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'food'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UtensilsCrossed size={18} />
          Food Analysis
        </button>
        <button
          onClick={() => { setActiveTab('workout'); clearImage(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'workout'
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Dumbbell size={18} />
          Workout Analysis
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {!preview ? (
          <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl hover:border-sky-400 hover:bg-sky-50/50 cursor-pointer transition-all">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              activeTab === 'food'
                ? 'bg-amber-50 text-amber-500'
                : 'bg-violet-50 text-violet-500'
            }`}>
              <Camera size={32} />
            </div>
            <p className="text-base font-semibold text-slate-700 mb-1">
              {activeTab === 'food' ? 'Upload Food Photo' : 'Upload Workout Screenshot'}
            </p>
            <p className="text-sm text-slate-400">Click or drag to upload an image</p>
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
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                activeTab === 'food'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analyzing with Gemini AI...
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Analyze {activeTab === 'food' ? 'Food' : 'Workout'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">
          <X size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Food Results */}
      {result && activeTab === 'food' && (
        <div className="space-y-4">
          {/* Calories Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Flame size={24} />
              <span className="text-sm font-semibold opacity-90">Total Calories</span>
            </div>
            <p className="text-4xl font-bold">{result.totalCalories || 0} <span className="text-lg opacity-80">kcal</span></p>
            {result.summary && <p className="mt-2 text-sm opacity-90">{result.summary}</p>}
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Protein', value: result.macros?.protein, icon: Beef, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Carbs', value: result.macros?.carbs, icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Fat', value: result.macros?.fat, icon: Droplets, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Fiber', value: result.macros?.fiber, icon: Droplets, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((macro) => {
              const Icon = macro.icon;
              return (
                <div key={macro.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className={`w-8 h-8 ${macro.bg} rounded-lg flex items-center justify-center mb-2`}>
                    <Icon size={16} className={macro.color} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{macro.value || 0}g</p>
                  <p className="text-xs text-slate-500">{macro.label}</p>
                </div>
              );
            })}
          </div>

          {/* Food Items */}
          {result.foodItems?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Detected Items</h3>
              <div className="space-y-2">
                {result.foodItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <span className="text-xs text-slate-400">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workout Results */}
      {result && activeTab === 'workout' && (
        <div className="space-y-4">
          {/* Overview */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20">
            <p className="text-sm font-semibold opacity-90 mb-1">{result.workoutType || 'Workout'}</p>
            <p className="text-3xl font-bold mb-2">{result.caloriesBurned || 0} <span className="text-lg opacity-80">kcal burned</span></p>
            {result.totalDuration && <p className="text-sm opacity-90">Duration: {result.totalDuration}</p>}
            {result.summary && <p className="mt-2 text-sm opacity-90">{result.summary}</p>}
          </div>

          {/* Exercises */}
          {result.exercises?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Exercises</h3>
              <div className="space-y-3">
                {result.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="font-medium text-slate-900">{ex.name}</p>
                      <div className="flex gap-3 mt-1">
                        {ex.sets && <span className="text-xs text-slate-500">{ex.sets} sets</span>}
                        {ex.reps && <span className="text-xs text-slate-500">{ex.reps} reps</span>}
                        {ex.weight && <span className="text-xs text-slate-500">{ex.weight}</span>}
                        {ex.duration && <span className="text-xs text-slate-500">{ex.duration}</span>}
                        {ex.distance && <span className="text-xs text-slate-500">{ex.distance}</span>}
                      </div>
                    </div>
                    <Dumbbell size={16} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
