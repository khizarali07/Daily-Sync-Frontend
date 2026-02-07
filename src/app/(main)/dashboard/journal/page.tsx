'use client';

import { useState, useEffect } from 'react';
import { aiApi } from '@/lib/api';
import { format, subDays } from 'date-fns';
import {
  BookOpen, Sparkles, Loader2, Calendar, ChevronRight,
  RefreshCw, AlertCircle, FileText
} from 'lucide-react';

interface Journal {
  id: string;
  date: string;
  summary: string;
  totalTasks: number;
  completedTasks: number;
  missedTasks: number;
  createdAt: string;
}

export default function JournalPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { loadJournals(); }, []);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getJournals();
      setJournals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load journals:', err);
    } finally { setLoading(false); }
  };

  const generateSummary = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await aiApi.generateSummary(selectedDate);
      const newJournal = res.data.data?.dailyLog;
      if (newJournal) {
        setSelectedJournal(newJournal);
        loadJournals(); // Refresh list
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate diary. Make sure you have tasks for this date.');
    } finally { setGenerating(false); }
  };

  const viewJournal = async (date: string) => {
    try {
      const res = await aiApi.getJournal(date);
      setSelectedJournal(res.data.data || null);
    } catch (err) {
      console.error('Failed to load journal:', err);
    }
  };

  const formatSummary = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-slate-900 mt-4 mb-2">{line.slice(2)}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-semibold text-slate-800 mt-3 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-base font-semibold text-slate-700 mt-2 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-slate-600 ml-4 mb-0.5">{line.slice(2)}</li>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-slate-700 mt-2">{line.slice(2, -2)}</p>;
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-slate-600 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Journal</h1>
        <p className="text-sm text-slate-500 mt-1">AI-generated daily diary entries based on your activity</p>
      </div>

      {/* Generate New */}
      <div className="bg-gradient-to-br from-sky-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Generate Daily Diary</h2>
            <p className="text-sm text-white/80 mt-1">
              AI will analyze your tasks, health data, and activity to create a personalized diary entry.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-white/20 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]"
              />
              <button
                onClick={generateSummary}
                disabled={generating}
                className="px-5 py-2 bg-white text-purple-600 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={16} /> Generate</>
                )}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-3 text-sm text-white/90 bg-white/10 rounded-xl p-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-purple-600" />
              <h3 className="font-semibold text-slate-900">Past Entries</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-sky-500" />
              </div>
            ) : journals.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No journal entries yet</p>
                <p className="text-xs text-slate-400 mt-1">Generate your first diary above</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {journals.map(j => (
                  <button
                    key={j.id}
                    onClick={() => viewJournal(typeof j.date === 'string' ? j.date.split('T')[0] : format(new Date(j.date), 'yyyy-MM-dd'))}
                    className={`w-full text-left p-3 rounded-xl transition-all hover:bg-slate-50 border ${
                      selectedJournal?.id === j.id
                        ? 'border-sky-200 bg-sky-50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {format(new Date(j.date), 'MMM d, yyyy')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-emerald-600 font-medium">{j.completedTasks}/{j.totalTasks} tasks</span>
                          {j.missedTasks > 0 && (
                            <span className="text-xs text-red-500 font-medium">{j.missedTasks} missed</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Journal Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
            {selectedJournal ? (
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {format(new Date(selectedJournal.date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                        {selectedJournal.completedTasks} completed
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                        {selectedJournal.totalTasks} total
                      </span>
                      {selectedJournal.missedTasks > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                          {selectedJournal.missedTasks} missed
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={generateSummary}
                    disabled={generating}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
                  </button>
                </div>
                <div className="prose prose-slate max-w-none text-sm">
                  {formatSummary(selectedJournal.summary)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen size={28} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No Entry Selected</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  Select a journal entry from the list or generate a new one for today.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
