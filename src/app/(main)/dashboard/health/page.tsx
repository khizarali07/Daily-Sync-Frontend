'use client';

import { useState, useEffect } from 'react';
import { healthApi } from '@/lib/api';
import { format } from 'date-fns';
import {
  Moon, Heart, Footprints, Flame, Droplets, Brain,
  Zap, Activity, Scale, Save, Loader2, CheckCircle2,
  AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function HealthPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    sleepDuration: '', sleepQuality: '', bedtime: '', wakeTime: '',
    restingHeartRate: '', avgHeartRate: '', maxHeartRate: '',
    steps: '', caloriesBurned: '', activeMinutes: '', distance: '',
    weight: '', bodyFat: '',
    caloriesConsumed: '', proteinGrams: '', carbsGrams: '', fatGrams: '', waterIntake: '',
    moodScore: '', energyLevel: '', stressLevel: '',
  });

  useEffect(() => { loadHealth(); }, [date]);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await healthApi.getByDate(date);
      const data = res.data.metrics;
      if (data) {
        setForm({
          sleepDuration: data.sleepDuration?.toString() || '',
          sleepQuality: data.sleepQuality || '',
          bedtime: data.bedtime || '',
          wakeTime: data.wakeTime || '',
          restingHeartRate: data.restingHeartRate?.toString() || '',
          avgHeartRate: data.avgHeartRate?.toString() || '',
          maxHeartRate: data.maxHeartRate?.toString() || '',
          steps: data.steps?.toString() || '',
          caloriesBurned: data.caloriesBurned?.toString() || '',
          activeMinutes: data.activeMinutes?.toString() || '',
          distance: data.distance?.toString() || '',
          weight: data.weight?.toString() || '',
          bodyFat: data.bodyFat?.toString() || '',
          caloriesConsumed: data.caloriesConsumed?.toString() || '',
          proteinGrams: data.proteinGrams?.toString() || '',
          carbsGrams: data.carbsGrams?.toString() || '',
          fatGrams: data.fatGrams?.toString() || '',
          waterIntake: data.waterIntake?.toString() || '',
          moodScore: data.moodScore?.toString() || '',
          energyLevel: data.energyLevel?.toString() || '',
          stressLevel: data.stressLevel?.toString() || '',
        });
      } else {
        setForm({
          sleepDuration: '', sleepQuality: '', bedtime: '', wakeTime: '',
          restingHeartRate: '', avgHeartRate: '', maxHeartRate: '',
          steps: '', caloriesBurned: '', activeMinutes: '', distance: '',
          weight: '', bodyFat: '',
          caloriesConsumed: '', proteinGrams: '', carbsGrams: '', fatGrams: '', waterIntake: '',
          moodScore: '', energyLevel: '', stressLevel: '',
        });
      }
    } catch (err) {
      console.error('Failed to load health:', err);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload: Record<string, any> = { date, source: 'manual' };
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== undefined) {
          if (['sleepQuality', 'bedtime', 'wakeTime'].includes(key)) {
            payload[key] = val;
          } else {
            const num = parseFloat(val);
            if (!isNaN(num)) payload[key] = num;
          }
        }
      });
      await healthApi.upsert(payload);
      setMessage('Health data saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const ScoreSelector = ({ label, value, onChange, color }: { label: string; value: string; onChange: (v: string) => void; color: string }) => (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-2 block">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button
            key={n}
            onClick={() => onChange(n.toString())}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              parseInt(value) === n
                ? `${color} text-white shadow-lg`
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  const changeDate = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">Log your daily health metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
          <button onClick={() => changeDate(1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
          <CheckCircle2 size={20} /> <span className="text-sm font-medium">{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <AlertCircle size={20} /> <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-sky-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sleep */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Moon size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Sleep</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Duration (hrs)</label>
                <input type="number" step="0.5" value={form.sleepDuration} onChange={e => updateForm('sleepDuration', e.target.value)} className="input-field" placeholder="7.5" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Quality</label>
                <select value={form.sleepQuality} onChange={e => updateForm('sleepQuality', e.target.value)} className="input-field">
                  <option value="">Select</option>
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Bedtime</label>
                <input type="time" value={form.bedtime} onChange={e => updateForm('bedtime', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Wake Time</label>
                <input type="time" value={form.wakeTime} onChange={e => updateForm('wakeTime', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <Heart size={20} className="text-rose-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Heart Rate</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Resting (BPM)</label>
                <input type="number" value={form.restingHeartRate} onChange={e => updateForm('restingHeartRate', e.target.value)} className="input-field" placeholder="65" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Average</label>
                <input type="number" value={form.avgHeartRate} onChange={e => updateForm('avgHeartRate', e.target.value)} className="input-field" placeholder="75" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Maximum</label>
                <input type="number" value={form.maxHeartRate} onChange={e => updateForm('maxHeartRate', e.target.value)} className="input-field" placeholder="145" />
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Footprints size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Steps</label>
                <input type="number" value={form.steps} onChange={e => updateForm('steps', e.target.value)} className="input-field" placeholder="8000" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Cal Burned</label>
                <input type="number" value={form.caloriesBurned} onChange={e => updateForm('caloriesBurned', e.target.value)} className="input-field" placeholder="450" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Active Min</label>
                <input type="number" value={form.activeMinutes} onChange={e => updateForm('activeMinutes', e.target.value)} className="input-field" placeholder="60" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Distance (km)</label>
                <input type="number" step="0.1" value={form.distance} onChange={e => updateForm('distance', e.target.value)} className="input-field" placeholder="5.2" />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Scale size={20} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Body</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Weight (kg)</label>
                <input type="number" step="0.1" value={form.weight} onChange={e => updateForm('weight', e.target.value)} className="input-field" placeholder="75.5" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Body Fat (%)</label>
                <input type="number" step="0.1" value={form.bodyFat} onChange={e => updateForm('bodyFat', e.target.value)} className="input-field" placeholder="18.5" />
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Flame size={20} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Nutrition</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Calories</label>
                <input type="number" value={form.caloriesConsumed} onChange={e => updateForm('caloriesConsumed', e.target.value)} className="input-field" placeholder="2000" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Protein (g)</label>
                <input type="number" value={form.proteinGrams} onChange={e => updateForm('proteinGrams', e.target.value)} className="input-field" placeholder="120" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Carbs (g)</label>
                <input type="number" value={form.carbsGrams} onChange={e => updateForm('carbsGrams', e.target.value)} className="input-field" placeholder="250" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Fat (g)</label>
                <input type="number" value={form.fatGrams} onChange={e => updateForm('fatGrams', e.target.value)} className="input-field" placeholder="65" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Water (L)</label>
                <input type="number" step="0.1" value={form.waterIntake} onChange={e => updateForm('waterIntake', e.target.value)} className="input-field" placeholder="2.5" />
              </div>
            </div>
          </div>

          {/* Mood & Energy */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Brain size={20} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Mood & Energy</h2>
            </div>
            <div className="space-y-5">
              <ScoreSelector label="Mood (1 = terrible, 10 = amazing)" value={form.moodScore} onChange={v => updateForm('moodScore', v)} color="bg-purple-500" />
              <ScoreSelector label="Energy Level" value={form.energyLevel} onChange={v => updateForm('energyLevel', v)} color="bg-amber-500" />
              <ScoreSelector label="Stress Level (1 = calm, 10 = very stressed)" value={form.stressLevel} onChange={v => updateForm('stressLevel', v)} color="bg-rose-500" />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 size={20} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={20} /> Save Health Data</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
