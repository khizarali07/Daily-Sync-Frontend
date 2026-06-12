"use client";

import { useState, useRef } from 'react';
import { aiApi, mealsApi } from '@/lib/api';
import {
  Camera, UtensilsCrossed, Upload, Loader2,
  Flame, Beef, Wheat, Droplets, X, Image as ImageIcon,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

export default function AIAnalysisPage() {
  const [entryMode, setEntryMode] = useState<'image' | 'manual'>('image');
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [editableFoodItems, setEditableFoodItems] = useState<{name: string, quantity: string, nutrients?: any}[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  const [manualFood, setManualFood] = useState<Record<string, string>>({
    mealType: 'Breakfast', name: '',
    calories: '', protein: '', carbs: '', fat: '', fiber: '',
    vitA: '', vitC: '', vitD: '', vitE: '', vitK: '',
    vitB1: '', vitB2: '', vitB3: '', vitB6: '', vitB7: '', vitB9: '', vitB12: '',
    calcium: '', magnesium: '', potassium: '', sodium: '', iron: '', zinc: '',
    iodine: '', selenium: '', copper: '', phosphorus: '', manganese: '',
    fluoride: '', chromium: '', molybdenum: '', chloride: '',
    omega3: '', epaDha: '', omega6: '', choline: ''
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setImage(resizedBase64);
          setPreview(resizedBase64);
          setResult(null);
          setError('');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await aiApi.analyzeFood(image);
      setResult(res.data.data);
      if (res.data.data.foodItems) {
        setEditableFoodItems(res.data.data.foodItems);
      }
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
    setSuccess('');
    setEditableFoodItems([]);
    setExpandedItem(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setError('');
    try {
      const res = await aiApi.recalculateFood(editableFoodItems);
      setResult(res.data.data);
      if (res.data.data.foodItems) {
        setEditableFoodItems(res.data.data.foodItems);
      }
      setSuccess('Meal recalculation successful!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Recalculation failed. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleManualSubmit = () => {
    setError('');
    setSuccess('');
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
  };

  const handleSaveToHealth = async () => {
    if (!result) return;
    setSavingHealth(true);
    setError('');
    setSuccess('');
    try {
      const today = new Date().toISOString().split('T')[0];
      
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
        ...result.vitamins,
        ...result.minerals,
        ...result.others
      };
      await mealsApi.create(payload);
      setSuccess('Successfully saved Meal Log!');
      
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
        <h1 className="text-2xl font-bold text-slate-900">Food Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyze food photos with Local AI or manually log your meals
        </p>
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
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-amber-50 text-amber-500">
                <Camera size={32} />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">Upload Food Photo</p>
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
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing with Local AI...
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Analyze Food
                  </>
                )}
              </button>
            </div>
          )
        ) : (
          <div className="space-y-6">
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
            
            <button
              onClick={handleManualSubmit}
              className="w-full py-3 mt-2 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"
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
      {result && (
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
                    const label = key.replace('vit', 'Vitamin ').replace(/([A-Z])/g, ' $1').replace(/\s*(mcg|mg|iu)$/i, '').trim();
                    const unit = key.toLowerCase().includes('mcg') ? 'mcg' : key.toLowerCase().includes('iu') ? 'IU' : 'mg';
                    return (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-600">{label}</span>
                        <span className="text-xs font-semibold text-slate-900">{parseFloat(Number(value || 0).toFixed(3))}{unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Minerals & Others</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries({...result.minerals, ...result.others}).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/\s*(mcg|mg|g)$/i, '').trim();
                    const labelCapitalized = label.charAt(0).toUpperCase() + label.slice(1);
                    const unit = key.toLowerCase().includes('mcg') ? 'mcg' : key.toLowerCase().includes('mg') ? 'mg' : 'g';
                    return (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-600">{labelCapitalized}</span>
                        <span className="text-xs font-semibold text-slate-900">{parseFloat(Number(value || 0).toFixed(3))}{unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Food Items */}
          {editableFoodItems?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Detected Items</h3>
              <div className="space-y-3">
                {editableFoodItems.map((item: any, i: number) => (
                  <div key={i} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-1 sm:gap-2 p-2 bg-slate-50/50">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...editableFoodItems];
                          newItems[i].name = e.target.value;
                          setEditableFoodItems(newItems);
                        }}
                        className="flex-1 min-w-0 bg-transparent px-1 sm:px-2 py-1 text-sm font-medium text-slate-800 outline-none border border-transparent focus:border-amber-300 focus:bg-white rounded"
                        placeholder="Food name"
                      />
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...editableFoodItems];
                          newItems[i].quantity = e.target.value;
                          setEditableFoodItems(newItems);
                        }}
                        className="w-16 sm:w-24 flex-shrink-0 bg-transparent px-1 sm:px-2 py-1 text-sm text-slate-600 outline-none border border-transparent focus:border-amber-300 focus:bg-white rounded text-right"
                        placeholder="Quantity"
                      />
                      <button
                        onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                        className="p-1 flex-shrink-0 hover:bg-slate-200 rounded text-slate-500"
                      >
                        {expandedItem === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {expandedItem === i && item.nutrients && (
                      <div className="p-3 bg-white border-t border-slate-100 text-xs text-slate-600">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="bg-amber-50 rounded p-1.5 text-center">
                            <span className="block font-bold text-amber-700">{item.nutrients.calories}</span>
                            <span className="text-[10px]">kcal</span>
                          </div>
                          <div className="bg-red-50 rounded p-1.5 text-center">
                            <span className="block font-bold text-red-700">{item.nutrients.protein}g</span>
                            <span className="text-[10px]">Protein</span>
                          </div>
                          <div className="bg-orange-50 rounded p-1.5 text-center">
                            <span className="block font-bold text-orange-700">{item.nutrients.carbs}g</span>
                            <span className="text-[10px]">Carbs</span>
                          </div>
                          <div className="bg-yellow-50 rounded p-1.5 text-center">
                            <span className="block font-bold text-yellow-700">{item.nutrients.fat}g</span>
                            <span className="text-[10px]">Fat</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries({ ...item.nutrients.vitamins, ...item.nutrients.minerals }).slice(0, 8).map(([k, v]: any) => {
                            if (v === 0) return null;
                            const label = k.replace('vit', 'Vit ').replace(/([A-Z])/g, ' $1').replace(/\s*(mcg|mg|iu|g)$/i, '').trim();
                            const unit = k.toLowerCase().includes('mcg') ? 'mcg' : k.toLowerCase().includes('mg') ? 'mg' : k.toLowerCase().includes('iu') ? 'IU' : 'g';
                            return (
                              <div key={k} className="flex justify-between border-b border-slate-50 py-0.5">
                                <span className="capitalize">{label}</span>
                                <span className="font-semibold">{v}{unit}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {recalculating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Recalculate Meal
              </button>
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
