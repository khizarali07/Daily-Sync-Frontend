"use client";

import { useState, useRef } from 'react';
import { aiApi, mealsApi } from '@/lib/api';
import {
  Camera, UtensilsCrossed, Dumbbell, Upload, Loader2,
  Flame, Beef, Wheat, Droplets, X, Image as ImageIcon
} from 'lucide-react';

type AnalysisType = 'food' | 'workout';

export default function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState<AnalysisType>('food');
  const [entryMode, setEntryMode] = useState<'image' | 'manual'>('image');
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [manualFood, setManualFood] = useState<Record<string, string>>({
    mealType: 'Breakfast', name: '',
    calories: '', protein: '', carbs: '', fat: '', fiber: '', water: '',
    vitA: '', vitC: '', vitD: '', vitE: '', vitK: '',
    vitB1: '', vitB2: '', vitB3: '', vitB6: '', vitB7: '', vitB9: '', vitB12: '',
    calcium: '', magnesium: '', potassium: '', sodium: '', iron: '', zinc: '',
    iodine: '', selenium: '', copper: '', phosphorus: '', manganese: '',
    fluoride: '', chromium: '', molybdenum: '', chloride: '',
    omega3: '', epaDha: '', omega6: '', choline: ''
  });

  const [manualWorkout, setManualWorkout] = useState({ type: 'Strength', caloriesBurned: '', duration: '', summary: '' });

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
    setSuccess('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleManualSubmit = () => {
    setError('');
    setSuccess('');
    if (activeTab === 'food') {
      if (!manualFood.calories && !manualFood.name) {
        setError('Please enter at least a name or calories.');
        return;
      }
      setResult({
        totalCalories: Number(manualFood.calories) || 0,
        macros: {
          protein: Number(manualFood.protein) || 0,
          carbs: Number(manualFood.carbs) || 0,
          fat: Number(manualFood.fat) || 0,
          fiber: Number(manualFood.fiber) || 0,
          water: Number(manualFood.water) || 0,
        },
        vitamins: {
          vitAMcg: Number(manualFood.vitA) || 0,
          vitCMg: Number(manualFood.vitC) || 0,
          vitDIu: Number(manualFood.vitD) || 0,
          vitEMg: Number(manualFood.vitE) || 0,
          vitKMcg: Number(manualFood.vitK) || 0,
          vitB1Mg: Number(manualFood.vitB1) || 0,
          vitB2Mg: Number(manualFood.vitB2) || 0,
          vitB3Mg: Number(manualFood.vitB3) || 0,
          vitB6Mg: Number(manualFood.vitB6) || 0,
          vitB7Mcg: Number(manualFood.vitB7) || 0,
          vitB9Mcg: Number(manualFood.vitB9) || 0,
          vitB12Mcg: Number(manualFood.vitB12) || 0,
        },
        minerals: {
          calciumMg: Number(manualFood.calcium) || 0,
          magnesiumMg: Number(manualFood.magnesium) || 0,
          potassiumMg: Number(manualFood.potassium) || 0,
          sodiumMg: Number(manualFood.sodium) || 0,
          ironMg: Number(manualFood.iron) || 0,
          zincMg: Number(manualFood.zinc) || 0,
          iodineMcg: Number(manualFood.iodine) || 0,
          seleniumMcg: Number(manualFood.selenium) || 0,
          copperMg: Number(manualFood.copper) || 0,
          phosphorusMg: Number(manualFood.phosphorus) || 0,
          manganeseMg: Number(manualFood.manganese) || 0,
          fluorideMg: Number(manualFood.fluoride) || 0,
          chromiumMcg: Number(manualFood.chromium) || 0,
          molybdenumMcg: Number(manualFood.molybdenum) || 0,
          chlorideMg: Number(manualFood.chloride) || 0,
        },
        others: {
          omega3G: Number(manualFood.omega3) || 0,
          epaDhaG: Number(manualFood.epaDha) || 0,
          omega6G: Number(manualFood.omega6) || 0,
          cholineMg: Number(manualFood.choline) || 0,
        },
        foodItems: manualFood.name ? [{ name: manualFood.name, quantity: '1 serving' }] : [],
        summary: `Manual Entry: ${manualFood.mealType}`,
        mealType: manualFood.mealType,
      });
    } else {
      if (!manualWorkout.caloriesBurned) {
        setError('Calories burned are required.');
        return;
      }
      setResult({
        workoutType: manualWorkout.type,
        caloriesBurned: Number(manualWorkout.caloriesBurned),
        totalDuration: manualWorkout.duration ? `${manualWorkout.duration} mins` : '',
        summary: manualWorkout.summary || 'Manually logged workout.',
        exercises: [],
      });
    }
  };

  const handleSaveToHealth = async () => {
    if (!result) return;
    setSavingHealth(true);
    setError('');
    setSuccess('');
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (activeTab === 'food') {
        const payload: any = { 
          date: today, 
          mealType: result.mealType || 'Snack',
          name: result.foodItems?.[0]?.name || 'AI Logged Food',
          summary: result.summary,
          calories: result.totalCalories || 0,
          proteinGrams: result.macros?.protein || 0,
          carbsGrams: result.macros?.carbs || 0,
          fatGrams: result.macros?.fat || 0,
          fiberGrams: result.macros?.fiber || 0,
          waterIntake: result.macros?.water || 0,
          ...result.vitamins,
          ...result.minerals,
          ...result.others
        };
        await mealsApi.create(payload);
        setSuccess('Successfully saved Meal Log!');
      } else {
        const payload: any = { date: today, source: 'ai-analysis' };
        payload.caloriesBurned = result.caloriesBurned || 0;
        if (result.totalDuration) {
          const match = result.totalDuration.match(/(\d+)/);
          if (match) payload.activeMinutes = Number(match[1]);
        }
        const { healthApi } = await import('@/lib/api');
        await healthApi.upsert(payload);
        setSuccess('Successfully saved to Health Log!');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Failed to save to log.');
    } finally {
      setSavingHealth(false);
    }
  };

  const updateFoodField = (field: string, value: string) => {
    setManualFood(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyze food photos and workout screenshots with Local AI
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

      {/* Mode Switcher */}
      <div className="flex bg-slate-200/50 rounded-lg p-1 w-fit mx-auto">
        <button
          onClick={() => setEntryMode('image')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${entryMode === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Image Upload
        </button>
        <button
          onClick={() => setEntryMode('manual')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${entryMode === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Manual Entry
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 flex items-center justify-center gap-3 shadow-sm">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">✓</div>
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Entry Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {entryMode === 'image' ? (
          !preview ? (
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
                    Analyzing with Local AI...
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Analyze {activeTab === 'food' ? 'Food' : 'Workout'}
                  </>
                )}
              </button>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {activeTab === 'food' ? (
              <div className="space-y-6">
                {/* Basic Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Meal Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500"
                      value={manualFood.mealType} onChange={e => updateFoodField('mealType', e.target.value)}
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Food Name / Summary</label>
                    <input type="text" placeholder="e.g. Grilled Chicken Salad" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500" 
                      value={manualFood.name} onChange={e => updateFoodField('name', e.target.value)} />
                  </div>
                </div>

                {/* Macros */}
                <div>
                  <h3 className="font-semibold text-slate-800 border-b pb-2 mb-3">Macros & Basics</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { key: 'calories', label: 'Calories (kcal)' },
                      { key: 'protein', label: 'Protein (g)' },
                      { key: 'carbs', label: 'Carbs (g)' },
                      { key: 'fat', label: 'Fat (g)' },
                      { key: 'fiber', label: 'Fiber (g)' },
                      { key: 'water', label: 'Water (L)' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-semibold text-slate-500 block truncate">{f.label}</label>
                        <input type="number" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500" 
                          value={manualFood[f.key]} onChange={e => updateFoodField(f.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vitamins */}
                <div>
                  <h3 className="font-semibold text-slate-800 border-b pb-2 mb-3">Vitamins</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { key: 'vitA', label: 'Vit A (mcg)' }, { key: 'vitC', label: 'Vit C (mg)' },
                      { key: 'vitD', label: 'Vit D (iu)' }, { key: 'vitE', label: 'Vit E (mg)' },
                      { key: 'vitK', label: 'Vit K (mcg)' }, { key: 'vitB1', label: 'Vit B1 (mg)' },
                      { key: 'vitB2', label: 'Vit B2 (mg)' }, { key: 'vitB3', label: 'Vit B3 (mg)' },
                      { key: 'vitB6', label: 'Vit B6 (mg)' }, { key: 'vitB7', label: 'Vit B7 (mcg)' },
                      { key: 'vitB9', label: 'Vit B9 (mcg)' }, { key: 'vitB12', label: 'Vit B12 (mcg)' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-semibold text-slate-500 block truncate">{f.label}</label>
                        <input type="number" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500" 
                          value={manualFood[f.key]} onChange={e => updateFoodField(f.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minerals */}
                <div>
                  <h3 className="font-semibold text-slate-800 border-b pb-2 mb-3">Minerals</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { key: 'calcium', label: 'Calcium (mg)' }, { key: 'magnesium', label: 'Magnesium (mg)' },
                      { key: 'potassium', label: 'Potassium (mg)' }, { key: 'sodium', label: 'Sodium (mg)' },
                      { key: 'iron', label: 'Iron (mg)' }, { key: 'zinc', label: 'Zinc (mg)' },
                      { key: 'iodine', label: 'Iodine (mcg)' }, { key: 'selenium', label: 'Selenium (mcg)' },
                      { key: 'copper', label: 'Copper (mg)' }, { key: 'phosphorus', label: 'Phosphorus (mg)' },
                      { key: 'manganese', label: 'Manganese (mg)' }, { key: 'fluoride', label: 'Fluoride (mg)' },
                      { key: 'chromium', label: 'Chromium (mcg)' }, { key: 'molybdenum', label: 'Molyb. (mcg)' },
                      { key: 'chloride', label: 'Chloride (mg)' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-semibold text-slate-500 block truncate">{f.label}</label>
                        <input type="number" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500" 
                          value={manualFood[f.key]} onChange={e => updateFoodField(f.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Others */}
                <div>
                  <h3 className="font-semibold text-slate-800 border-b pb-2 mb-3">Others</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'omega3', label: 'Omega-3 (g)' }, { key: 'epaDha', label: 'EPA & DHA (g)' },
                      { key: 'omega6', label: 'Omega-6 (g)' }, { key: 'choline', label: 'Choline (mg)' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-semibold text-slate-500 block truncate">{f.label}</label>
                        <input type="number" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500" 
                          value={manualFood[f.key]} onChange={e => updateFoodField(f.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Workout Type</label>
                  <input type="text" placeholder="e.g. Strength Training, Running" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500" 
                    value={manualWorkout.type} onChange={e => setManualWorkout(prev => ({...prev, type: e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Calories Burned (kcal)</label>
                  <input type="number" placeholder="350" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500" 
                    value={manualWorkout.caloriesBurned} onChange={e => setManualWorkout(prev => ({...prev, caloriesBurned: e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Duration (mins)</label>
                  <input type="number" placeholder="45" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500" 
                    value={manualWorkout.duration} onChange={e => setManualWorkout(prev => ({...prev, duration: e.target.value}))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Summary / Notes</label>
                  <input type="text" placeholder="e.g. Heavy leg day" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500" 
                    value={manualWorkout.summary} onChange={e => setManualWorkout(prev => ({...prev, summary: e.target.value}))} />
                </div>
              </div>
            )}
            
            <button
              onClick={handleManualSubmit}
              className={`w-full py-3 mt-2 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'food'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20'
              }`}
            >
              Review Before Saving
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Flame size={24} />
                <span className="text-sm font-semibold opacity-90">{result.mealType || 'Meal'}</span>
              </div>
              <span className="text-sm font-semibold opacity-90">Total Calories</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-4xl font-bold">{result.totalCalories || 0} <span className="text-lg opacity-80">kcal</span></p>
                {result.summary && <p className="mt-2 text-sm opacity-90">{result.summary}</p>}
              </div>
            </div>
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

          {/* Vitamins & Minerals */}
          {result.vitamins && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Vitamins</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(result.vitamins).map(([key, value]) => {
                    const label = key.replace('vit', 'Vitamin ').replace(/([A-Z])/g, ' $1').replace(/mcg|mg|iu/gi, '').trim();
                    const unit = key.toLowerCase().includes('mcg') ? 'mcg' : key.toLowerCase().includes('iu') ? 'IU' : 'mg';
                    return (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-600">{label}</span>
                        <span className="text-xs font-semibold text-slate-900">{Number(value) || 0}{unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Minerals & Others</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries({...result.minerals, ...result.others}).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/mcg|mg|g/gi, '').trim();
                    const labelCapitalized = label.charAt(0).toUpperCase() + label.slice(1);
                    const unit = key.toLowerCase().includes('mcg') ? 'mcg' : key.toLowerCase().includes('mg') ? 'mg' : 'g';
                    return (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-600">{labelCapitalized}</span>
                        <span className="text-xs font-semibold text-slate-900">{Number(value) || 0}{unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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

          {/* Save to Health Log Button */}
          <button
            onClick={handleSaveToHealth}
            disabled={savingHealth}
            className="w-full mt-4 py-4 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {savingHealth ? <Loader2 size={20} className="animate-spin" /> : <Flame size={20} />}
            Confirm & Save to Health Log
          </button>
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

          {/* Save to Health Log Button */}
          <button
            onClick={handleSaveToHealth}
            disabled={savingHealth}
            className="w-full mt-4 py-4 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {savingHealth ? <Loader2 size={20} className="animate-spin" /> : <Flame size={20} />}
            Confirm & Save to Health Log
          </button>
        </div>
      )}
    </div>
  );
}
