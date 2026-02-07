'use client';

import { useState, useEffect } from 'react';
import { aiApi, tasksApi } from '@/lib/api';
import { format, subDays, startOfWeek, addDays, getDay, subWeeks } from 'date-fns';
import {
  BarChart3, Calendar, TrendingUp, Target, Loader2,
  Flame, Award, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface HeatmapDay {
  date: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<{ date: string; completed: number; total: number; rate: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [avgRate, setAvgRate] = useState(0);
  const [bestDay, setBestDay] = useState('');
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getConsistency();
      const raw: HeatmapDay[] = res.data.stats || [];
      setHeatmapData(raw);

      // Compute stats from heatmap data
      if (raw.length > 0) {
        const rates = raw.filter(d => d.totalTasks > 0).map(d => d.completionRate);
        setAvgRate(rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0);

        let completed = 0;
        raw.forEach(d => completed += d.completedTasks);
        setTotalCompleted(completed);

        // Find best day
        const best = raw.reduce((a, b) => a.completionRate > b.completionRate ? a : b);
        setBestDay(best.date);

        // Calculate streak
        let s = 0;
        const sorted = [...raw].sort((a, b) => b.date.localeCompare(a.date));
        for (const d of sorted) {
          if (d.totalTasks > 0 && d.completionRate >= 80) s++;
          else if (d.totalTasks > 0) break;
        }
        setStreak(s);
      }

      // Compute last 7 days for bar chart
      const last7: typeof weeklyStats = [];
      for (let i = 6; i >= 0; i--) {
        const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const match = raw.find(d => d.date === dateStr);
        last7.push({
          date: dateStr,
          completed: match?.completedTasks || 0,
          total: match?.totalTasks || 0,
          rate: match?.completionRate || 0,
        });
      }
      setWeeklyStats(last7);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally { setLoading(false); }
  };

  // Build 12-week heatmap grid
  const buildHeatmapGrid = () => {
    const weeks: { date: string; rate: number; count: number }[][] = [];
    const today = new Date();
    const weeksToShow = 12;

    for (let w = weeksToShow - 1; w >= 0; w--) {
      const weekStart = startOfWeek(subWeeks(today, w), { weekStartsOn: 0 });
      const week: { date: string; rate: number; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = addDays(weekStart, d);
        const dateStr = format(day, 'yyyy-MM-dd');
        const match = heatmapData.find(h => h.date === dateStr);
        week.push({
          date: dateStr,
          rate: match?.completionRate || 0,
          count: match?.completedTasks || 0,
        });
      }
      weeks.push(week);
    }
    return weeks;
  };

  const getHeatColor = (rate: number) => {
    if (rate === 0) return 'bg-slate-100';
    if (rate < 25) return 'bg-sky-100';
    if (rate < 50) return 'bg-sky-200';
    if (rate < 75) return 'bg-sky-400';
    if (rate < 100) return 'bg-sky-500';
    return 'bg-sky-600';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxBarVal = Math.max(...weeklyStats.map(d => d.total), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Track your consistency and progress over time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className="text-orange-500" />
            <span className="text-xs font-medium text-slate-500">Streak</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{streak}</p>
          <p className="text-xs text-slate-400">days</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-sky-500" />
            <span className="text-xs font-medium text-slate-500">Avg Rate</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{avgRate}%</p>
          <p className="text-xs text-slate-400">completion</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={18} className="text-purple-500" />
            <span className="text-xs font-medium text-slate-500">Total Done</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalCompleted}</p>
          <p className="text-xs text-slate-400">tasks</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <span className="text-xs font-medium text-slate-500">Best Day</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{bestDay ? format(new Date(bestDay + 'T00:00:00'), 'MMM d') : '—'}</p>
          <p className="text-xs text-slate-400">highest rate</p>
        </div>
      </div>

      {/* Consistency Heatmap */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Consistency Heatmap</h2>
            <p className="text-xs text-slate-500">Last 12 weeks of task completion</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 pt-0">
              {dayLabels.map(d => (
                <div key={d} className="h-5 flex items-center">
                  <span className="text-[10px] text-slate-400 w-6">{d.slice(0, 2)}</span>
                </div>
              ))}
            </div>
            {/* Weeks */}
            {buildHeatmapGrid().map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-5 h-5 rounded-sm ${getHeatColor(day.rate)} transition-colors cursor-pointer`}
                    title={`${day.date}: ${day.count} tasks, ${day.rate}%`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-[10px] text-slate-400">Less</span>
          {['bg-slate-100', 'bg-sky-100', 'bg-sky-200', 'bg-sky-400', 'bg-sky-500', 'bg-sky-600'].map((c, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-slate-400">More</span>
        </div>
      </div>

      {/* Last 7 Days Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <BarChart3 size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Last 7 Days</h2>
            <p className="text-xs text-slate-500">Daily completion breakdown</p>
          </div>
        </div>

        <div className="flex items-end gap-3 h-48">
          {weeklyStats.map((day, i) => {
            const totalH = (day.total / maxBarVal) * 100;
            const completedH = day.total > 0 ? (day.completed / day.total) * totalH : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="text-xs font-bold text-slate-700 mb-1">{day.rate}%</div>
                <div className="w-full relative flex flex-col justify-end" style={{ height: '140px' }}>
                  <div className="bg-slate-100 rounded-t-lg w-full absolute bottom-0" style={{ height: `${totalH}%` }} />
                  <div className="bg-gradient-to-t from-sky-500 to-purple-500 rounded-t-lg w-full absolute bottom-0 z-10" style={{ height: `${completedH}%` }} />
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-medium">{format(new Date(day.date + 'T00:00:00'), 'EEE')}</div>
                <div className="text-[10px] text-slate-400">{format(new Date(day.date + 'T00:00:00'), 'MMM d')}</div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-sky-500 to-purple-500" />
            <span className="text-xs text-slate-500">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-100" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
