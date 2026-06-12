'use client';

import { useState } from 'react';
import { aiApi } from '@/lib/api';
import {
  Calculator, Plus, Trash2, Beef, Wheat, Droplets, Flame, Loader2, X
} from 'lucide-react';

interface FoodItem {
  name: string;
  quantity: string;
}

const FDA_DAILY_VALUES: Record<string, number> = {
  totalCalories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
  
  vitAMcg: 900,
  vitCMg: 90,
  vitDIu: 800,
  vitEMg: 15,
  vitKMcg: 120,
  vitB1Mg: 1.2,
  vitB2Mg: 1.3,
  vitB3Mg: 16,
  vitB6Mg: 1.7,
  vitB7Mcg: 30,
  vitB9Mcg: 400,
  vitB12Mcg: 2.4,
  
  calciumMg: 1300,
  magnesiumMg: 420,
  potassiumMg: 4700,
  sodiumMg: 2300,
  ironMg: 18,
  zincMg: 11,
  iodineMcg: 150,
  seleniumMcg: 55,
  copperMg: 0.9,
  phosphorusMg: 1250,
  chlorideMg: 2300,
  manganeseMg: 2.3,
  fluorideMg: 4,
  chromiumMcg: 35,
  molybdenumMcg: 45,
  
  omega3G: 1.6,
  omega6G: 17,
  cholineMg: 550,
};

function TargetProgress({ label, value, targetKey }: { label: string, value: number, targetKey: string }) {
  const target = FDA_DAILY_VALUES[targetKey];
  if (!target) return null;
  
  const rawPercentage = (value / target) * 100;
  const percentage = Math.round(rawPercentage);
  const widthPercentage = Math.min(percentage, 100);
  
  let barColor = "bg-teal-500";
  if (percentage >= 100) barColor = "bg-emerald-500";
  else if (percentage < 20) barColor = "bg-rose-400";
  else if (percentage < 50) barColor = "bg-amber-400";
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${widthPercentage}%` }}></div>
      </div>
    </div>
  );
}

export default function FoodCalculatorPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [currentGrams, setCurrentGrams] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName.trim() || !currentGrams.trim()) return;
    
    setItems([...items, { name: currentName.trim(), quantity: `${currentGrams.trim()}g` }]);
    setCurrentName('');
    setCurrentGrams('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCalculate = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.recalculateFood(
        items,
        "Calculated from manual food calculator"
      );
      setResult(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to calculate nutrients");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 via-emerald-600 to-green-600 rounded-3xl p-8 text-white shadow-xl shadow-teal-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Calculator size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Food Calculator</h1>
            <p className="text-teal-100 mt-1">Get precise nutrient data for custom foods</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Add Food Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Food Name (e.g. Ground Beef, Roti)</label>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition-colors"
                  placeholder="Enter food name"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Quantity (Grams)</label>
                <input
                  type="number"
                  value={currentGrams}
                  onChange={(e) => setCurrentGrams(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition-colors"
                  placeholder="e.g. 100"
                  min="1"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Add Item
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-fit">
            <h2 className="font-semibold text-slate-900 mb-4">Your Meal</h2>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No items added yet.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleCalculate}
              disabled={items.length === 0 || loading}
              className="w-full py-3 mt-auto rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  Calculate Nutrients
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Results Display */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3 mb-6">
              <X size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/50">
              <Calculator size={48} className="mb-4 opacity-50" />
              <p className="font-medium text-slate-600">Add foods and calculate to see results</p>
              <p className="text-sm mt-2 max-w-sm">We use the USDA National Nutrient Database to fetch 100% accurate data for 34 distinct macro and micro nutrients.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Calories Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Flame size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame size={24} className="text-teal-400" />
                    <span className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Total Energy</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-5xl font-bold">{result.totalCalories || 0}</p>
                    <p className="text-xl font-medium text-slate-400 mb-1">kcal</p>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Protein', value: result.macros?.protein, icon: Beef, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
                  { label: 'Carbs', value: result.macros?.carbs, icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
                  { label: 'Fat', value: result.macros?.fat, icon: Droplets, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
                  { label: 'Fiber', value: result.macros?.fiber, icon: Droplets, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                ].map((macro) => {
                  const Icon = macro.icon;
                  return (
                    <div key={macro.label} className={`bg-white rounded-2xl border ${macro.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className={`w-10 h-10 ${macro.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon size={20} className={macro.color} />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{macro.value || 0}<span className="text-sm font-semibold text-slate-500 ml-1">g</span></p>
                      <p className="text-sm font-medium text-slate-600 mt-1">{macro.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Vitamins & Minerals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vitamins */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-sky-500 rounded-full"></div>
                    <h3 className="font-bold text-slate-900 text-lg">Vitamins</h3>
                  </div>
                  <div className="space-y-0.5">
                    {result.vitamins && Object.entries(result.vitamins).map(([key, value]) => {
                      const label = key.replace('vit', 'Vitamin ').replace(/([A-Z])/g, ' $1').replace(/mcg|mg|iu/gi, '').trim();
                      const unit = key.toLowerCase().includes('mcg') ? 'mcg' : key.toLowerCase().includes('iu') ? 'IU' : 'mg';
                      return (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                          <span className="text-sm text-slate-600 font-medium">{label}</span>
                          <span className="text-sm font-bold text-slate-900">{Number(value) || 0}<span className="text-xs font-semibold text-slate-500 ml-1">{unit}</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Minerals & Others */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                    <h3 className="font-bold text-slate-900 text-lg">Minerals & Essential Fatty Acids</h3>
                  </div>
                  <div className="space-y-0.5">
                    {result.minerals && Object.entries({...result.minerals, ...result.others}).map(([key, value]) => {
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/mcg|mg|g/gi, '').trim();
                      const labelCapitalized = label.charAt(0).toUpperCase() + label.slice(1);
                      const unit = key.toLowerCase().includes('mcg') ? 'mcg' : key.toLowerCase().includes('mg') ? 'mg' : 'g';
                      return (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                          <span className="text-sm text-slate-600 font-medium">{labelCapitalized}</span>
                          <span className="text-sm font-bold text-slate-900">{Number(value) || 0}<span className="text-xs font-semibold text-slate-500 ml-1">{unit}</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Daily Targets Completion */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <Flame size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Daily Targets Completion</h3>
                    <p className="text-sm text-slate-500">Based on standard FDA 2000-calorie diet guidelines</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  <TargetProgress label="Calories" value={result.totalCalories || 0} targetKey="totalCalories" />
                  <TargetProgress label="Protein" value={result.macros?.protein || 0} targetKey="protein" />
                  <TargetProgress label="Carbs" value={result.macros?.carbs || 0} targetKey="carbs" />
                  <TargetProgress label="Fat" value={result.macros?.fat || 0} targetKey="fat" />
                  <TargetProgress label="Fiber" value={result.macros?.fiber || 0} targetKey="fiber" />
                  
                  {result.vitamins && Object.entries(result.vitamins).map(([key, value]) => {
                    const label = key.replace('vit', 'Vitamin ').replace(/([A-Z])/g, ' $1').replace(/mcg|mg|iu/gi, '').trim();
                    return <TargetProgress key={key} label={label} value={Number(value) || 0} targetKey={key} />
                  })}
                  
                  {result.minerals && Object.entries({...result.minerals, ...result.others}).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/mcg|mg|g/gi, '').trim();
                    const labelCapitalized = label.charAt(0).toUpperCase() + label.slice(1);
                    return <TargetProgress key={key} label={labelCapitalized} value={Number(value) || 0} targetKey={key} />
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
