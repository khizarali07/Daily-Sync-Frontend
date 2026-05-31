"use client";

import { useState, useEffect } from "react";
import { nutritionTargetsApi } from "@/lib/api";
import { Loader2, Save, AlertCircle } from "lucide-react";

interface Target {
  nutrient: string;
  min: number | null;
  max: number | null;
  target: number | null;
  unit: string;
}

const NUTRIENT_GROUPS = [
  {
    title: "Macros & Basics",
    items: [
      { name: "Calories", key: "Calories", unit: "kcal" },
      { name: "Water", key: "Water", unit: "L" },
      { name: "Protein", key: "Protein", unit: "g" },
      { name: "Carbs", key: "Carbs", unit: "g" },
      { name: "Fats", key: "Fats", unit: "g" },
      { name: "Fiber", key: "Fiber", unit: "g" },
    ],
  },
  {
    title: "Vitamins",
    items: [
      { name: "Vitamin A", key: "Vit A", unit: "mcg" },
      { name: "Vitamin C", key: "Vit C", unit: "mg" },
      { name: "Vitamin D", key: "Vit D", unit: "iu" },
      { name: "Vitamin E", key: "Vit E", unit: "mg" },
      { name: "Vitamin K", key: "Vit K", unit: "mcg" },
      { name: "Vitamin B1", key: "Vit B1", unit: "mg" },
      { name: "Vitamin B2", key: "Vit B2", unit: "mg" },
      { name: "Vitamin B3", key: "Vit B3", unit: "mg" },
      { name: "Vitamin B6", key: "Vit B6", unit: "mg" },
      { name: "Vitamin B7", key: "Vit B7", unit: "mcg" },
      { name: "Vitamin B9", key: "Vit B9", unit: "mcg" },
      { name: "Vitamin B12", key: "Vit B12", unit: "mcg" },
    ],
  },
  {
    title: "Minerals",
    items: [
      { name: "Calcium", key: "Calcium", unit: "mg" },
      { name: "Magnesium", key: "Magnesium", unit: "mg" },
      { name: "Potassium", key: "Potassium", unit: "mg" },
      { name: "Sodium", key: "Sodium", unit: "mg" },
      { name: "Iron", key: "Iron", unit: "mg" },
      { name: "Zinc", key: "Zinc", unit: "mg" },
      { name: "Iodine", key: "Iodine", unit: "mcg" },
      { name: "Selenium", key: "Selenium", unit: "mcg" },
      { name: "Copper", key: "Copper", unit: "mg" },
      { name: "Phosphorus", key: "Phosphorus", unit: "mg" },
      { name: "Manganese", key: "Manganese", unit: "mg" },
      { name: "Fluoride", key: "Fluoride", unit: "mg" },
      { name: "Chromium", key: "Chromium", unit: "mcg" },
      { name: "Molybdenum", key: "Molybdenum", unit: "mcg" },
      { name: "Chloride", key: "Chloride", unit: "mg" },
    ],
  },
  {
    title: "Others",
    items: [
      { name: "Omega-3", key: "Omega-3", unit: "g" },
      { name: "EPA & DHA", key: "EPA_DHA", unit: "g" },
      { name: "Omega-6", key: "Omega-6", unit: "g" },
      { name: "Choline", key: "Choline", unit: "mg" },
    ],
  },
];

export default function NutritionTargetsPage() {
  const [targets, setTargets] = useState<Record<string, Target>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const res = await nutritionTargetsApi.getAll();
      const targetsMap: Record<string, Target> = {};
      res.data.data.forEach((t: any) => {
        targetsMap[t.nutrient] = t;
      });
      setTargets(targetsMap);
    } catch (err) {
      console.error(err);
      setError("Failed to load targets");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (nutrient: string, unit: string, field: "min" | "max" | "target", value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    
    setTargets(prev => ({
      ...prev,
      [nutrient]: {
        ...prev[nutrient],
        nutrient,
        unit,
        [field]: numValue,
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const targetsArray = Object.values(targets).filter(
        t => t.min !== null || t.max !== null || t.target !== null
      );
      
      if (targetsArray.length > 0) {
        await nutritionTargetsApi.bulkUpdate(targetsArray);
      }
      setSuccess("Nutrition targets saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save targets");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nutrition Targets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Set custom limits and goals for macro and micronutrients.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Targets
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="space-y-8">
        {NUTRIENT_GROUPS.map(group => (
          <div key={group.title} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900">{group.title}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map(item => {
                  const target = targets[item.key] || { min: null, max: null, target: null };
                  
                  return (
                    <div key={item.key} className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:border-slate-200 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{item.unit}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Min</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={target.min ?? ""}
                            onChange={(e) => handleInputChange(item.key, item.unit, "min", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={target.target ?? ""}
                            onChange={(e) => handleInputChange(item.key, item.unit, "target", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Max</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={target.max ?? ""}
                            onChange={(e) => handleInputChange(item.key, item.unit, "max", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
