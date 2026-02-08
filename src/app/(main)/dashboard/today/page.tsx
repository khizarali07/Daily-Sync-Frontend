'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import { format, addDays, subDays, isToday, parseISO } from 'date-fns';
import {
  ChevronLeft, ChevronRight, Check, X, Clock, Plus,
  MessageSquare, Calendar, AlertCircle, Loader2
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  category?: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  missedReason?: string;
  imageUrl?: string;
  aiData?: any;
}

const categoryColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Prayer: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Spiritual: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Workout: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Fitness: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Training: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Study: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Studying: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Education: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Eating: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Meal: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Food: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Hygiene: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  Sleep: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  Break: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  Reciting: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  Work: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
};

const getCategory = (cat?: string) => {
  if (!cat) return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  return categoryColors[cat] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
};

function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDuration(startTime: string, endTime: string): string {
  if (!endTime) return '';
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff <= 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours} h ${mins} min`;
  if (hours > 0) return `${hours} h`;
  return `${mins} min`;
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [missedText, setMissedText] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', startTime: '', endTime: '', category: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = isToday(selectedDate)
        ? await tasksApi.getToday()
        : await tasksApi.getByDate(dateStr);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [dateStr, selectedDate]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleComplete = async (taskId: string, completed: boolean) => {
    setActionLoading(taskId);
    try {
      await tasksApi.completeTask(taskId, {
        isCompleted: completed,
        notes: noteText || undefined,
      });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: completed, notes: noteText || t.notes } : t));
      setActiveTask(null);
      setNoteText('');
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMissedReason = async (taskId: string) => {
    setActionLoading(taskId);
    try {
      await tasksApi.completeTask(taskId, {
        isCompleted: false,
        missedReason: missedText,
      });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, missedReason: missedText } : t));
      setActiveTask(null);
      setMissedText('');
    } catch (err) {
      console.error('Failed to save reason:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.name || !newTask.startTime || !newTask.endTime) return;
    try {
      await tasksApi.createTask({
        name: newTask.name,
        date: dateStr,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
        category: newTask.category || undefined,
      });
      setNewTask({ name: '', startTime: '', endTime: '', category: '' });
      setShowAddTask(false);
      loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Date Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
            </h2>
            <p className="text-sm text-slate-500">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Quick date buttons */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {[-2, -1, 0, 1, 2].map(offset => {
            const d = addDays(new Date(), offset);
            const active = format(d, 'yyyy-MM-dd') === dateStr;
            return (
              <button
                key={offset}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-br from-sky-500 to-purple-600 text-white shadow-lg shadow-sky-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{format(d, 'EEE')}</span>
                <span className="text-lg font-bold">{format(d, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              {completedCount}/{tasks.length} tasks completed
            </span>
          </div>
          <span className="text-sm font-bold text-slate-900">{completionRate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-purple-600 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-sky-500" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Tasks Scheduled</h3>
            <p className="text-sm text-slate-500 mb-4">
              Upload a CSV in the Schedule page to create task templates
            </p>
            <button
              onClick={() => setShowAddTask(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>
        ) : (
          (() => {
            // Group overlapping tasks
            const taskGroups: Task[][] = [];
            let currentGroup: Task[] = [];

            tasks.forEach((task, index) => {
              if (index === 0) {
                currentGroup.push(task);
                return;
              }

              const prevTask = currentGroup[currentGroup.length - 1];
              const [h1, m1] = prevTask.endTime.split(':').map(Number);
              const [h2, m2] = task.startTime.split(':').map(Number);
              const prevEndMinutes = h1 * 60 + m1;
              const currentStartMinutes = h2 * 60 + m2;

              // Check if current task overlaps with any task in the current group
              const overlapsWithGroup = currentGroup.some(groupTask => {
                const [gh1, gm1] = groupTask.startTime.split(':').map(Number);
                const [gh2, gm2] = groupTask.endTime.split(':').map(Number);
                const groupStartMinutes = gh1 * 60 + gm1;
                const groupEndMinutes = gh2 * 60 + gm2;
                
                return (
                  (currentStartMinutes >= groupStartMinutes && currentStartMinutes < groupEndMinutes) ||
                  (currentStartMinutes < groupStartMinutes && prevEndMinutes > groupStartMinutes)
                );
              });

              if (overlapsWithGroup || currentStartMinutes < prevEndMinutes) {
                currentGroup.push(task);
              } else {
                taskGroups.push([...currentGroup]);
                currentGroup = [task];
              }
            });

            if (currentGroup.length > 0) {
              taskGroups.push(currentGroup);
            }

            return taskGroups.map((group, groupIndex) => {
              const isOverlapGroup = group.length > 1;
              
              // Calculate group time range
              const groupStartTimes = group.map(t => {
                const [h, m] = t.startTime.split(':').map(Number);
                return h * 60 + m;
              });
              const groupEndTimes = group.map(t => {
                const [h, m] = t.endTime.split(':').map(Number);
                return h * 60 + m;
              });
              const groupStartMinutes = Math.min(...groupStartTimes);
              const groupEndMinutes = Math.max(...groupEndTimes);

              // Calculate free time before this group
              let freeTimeBlock = null;
              if (groupIndex > 0) {
                const prevGroup = taskGroups[groupIndex - 1];
                const prevGroupEndTimes = prevGroup.map(t => {
                  const [h, m] = t.endTime.split(':').map(Number);
                  return h * 60 + m;
                });
                const prevGroupEndMinutes = Math.max(...prevGroupEndTimes);
                const gapMinutes = groupStartMinutes - prevGroupEndMinutes;

                if (gapMinutes > 0) {
                  const prevGroupLastTask = prevGroup[prevGroup.length - 1];
                  const currentGroupFirstTask = group[0];
                  const gapHours = Math.floor(gapMinutes / 60);
                  const gapMins = gapMinutes % 60;
                  const gapDuration = gapHours > 0 && gapMins > 0 
                    ? `${gapHours} h ${gapMins} min` 
                    : gapHours > 0 
                      ? `${gapHours} h` 
                      : `${gapMins} min`;

                  freeTimeBlock = (
                    <div key={`free-${groupIndex}`} className="flex gap-3 mb-3">
                      <div className="w-16 flex-shrink-0 flex flex-col justify-between text-right py-3">
                        <span className="text-[10px] font-semibold text-slate-400 leading-tight">
                          {formatTime12h(prevGroupLastTask.endTime)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 leading-tight">
                          {formatTime12h(currentGroupFirstTask.startTime)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center py-3">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-300 ring-2 ring-white z-10" />
                        <div className="w-0.5 flex-1 bg-transparent my-0.5 border-l border-dashed border-slate-300" />
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-300 ring-2 ring-white z-10" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-dashed border-slate-250 shadow-sm py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Free Time
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={11} className="text-slate-400" />
                              <span className="text-[10px] font-semibold text-slate-500">{gapDuration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              const firstTask = group[0];
              const lastTask = group[group.length - 1];
              const groupStartTime = group.reduce((earliest, t) => {
                const [h1, m1] = earliest.startTime.split(':').map(Number);
                const [h2, m2] = t.startTime.split(':').map(Number);
                return (h2 * 60 + m2) < (h1 * 60 + m1) ? t : earliest;
              }).startTime;
              
              const groupEndTime = group.reduce((latest, t) => {
                const [h1, m1] = latest.endTime.split(':').map(Number);
                const [h2, m2] = t.endTime.split(':').map(Number);
                return (h2 * 60 + m2) > (h1 * 60 + m1) ? t : latest;
              }).endTime;

              return (
                <React.Fragment key={`group-${groupIndex}`}>
                  {freeTimeBlock}
                  <div className={`flex gap-3 mb-3 ${isOverlapGroup ? 'relative' : ''}`}>
                    {isOverlapGroup && (
                      <div className="absolute -top-2 left-20 z-20">
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shadow-sm">
                          <AlertCircle size={10} className="text-amber-600" />
                          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">
                            {group.length} Overlaps
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Shared Time Column */}
                    <div className="w-16 flex-shrink-0 flex flex-col justify-between text-right py-4">
                      <span className={`text-xs font-bold leading-tight ${isOverlapGroup ? 'text-amber-600' : 'text-slate-700'}`}>
                        {formatTime12h(groupStartTime)}
                      </span>
                      <span className={`text-xs font-semibold leading-tight ${isOverlapGroup ? 'text-amber-500' : 'text-slate-500'}`}>
                        {formatTime12h(groupEndTime)}
                      </span>
                    </div>

                    {/* Shared Timeline */}
                    <div className="flex flex-col items-center py-4">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isOverlapGroup ? 'bg-amber-500 animate-pulse' : group[0].isCompleted ? 'bg-emerald-500' : getCategory(group[0].category).dot} ring-4 ring-white shadow-sm z-10`} />
                      <div className={`w-0.5 flex-1 my-1 rounded-full ${isOverlapGroup ? 'bg-gradient-to-b from-amber-300 to-amber-400' : 'bg-slate-200'}`} />
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOverlapGroup ? 'bg-amber-500' : 'bg-rose-500'} ring-4 ring-white shadow-sm z-10`} />
                    </div>

                    {/* Task Cards Container */}
                    <div className="flex-1 space-y-2">
                      {group.map((task) => {
                        const cat = getCategory(task.category);
                        const duration = formatDuration(task.startTime, task.endTime);
                        const isExpanded = activeTask === task.id;

                        return (
                          <div key={task.id}
                            className={`bg-white rounded-xl border ${task.isCompleted ? 'border-emerald-200 bg-emerald-50/30' : isOverlapGroup ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'} shadow-sm hover:shadow-lg transition-all cursor-pointer ${isOverlapGroup ? 'ring-1 ring-amber-100' : ''}`}
                            onClick={() => setActiveTask(isExpanded ? null : task.id)}
                          >
                            <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            {task.category && (
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${cat.bg} ${cat.text}`}>
                                {task.category}
                              </span>
                            )}
                            {isOverlapGroup && (
                              <span className="text-[9px] font-semibold text-amber-600 ml-auto">
                                {formatTime12h(task.startTime)} - {formatTime12h(task.endTime)}
                              </span>
                            )}
                          </div>
                          <h3 className={`font-semibold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {task.name}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                          )}
                          {duration && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Clock size={12} className="text-slate-400" />
                              <span className="text-xs text-slate-400">{duration}</span>
                            </div>
                          )}
                          {task.notes && (
                            <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 px-2 py-1 rounded-md">
                              📝 {task.notes}
                            </p>
                          )}
                          {task.missedReason && !task.isCompleted && (
                            <p className="text-xs text-red-500 mt-1.5 italic bg-red-50 px-2 py-1 rounded-md">
                              ❌ {task.missedReason}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(task.id, !task.isCompleted);
                          }}
                          disabled={actionLoading === task.id}
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            task.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-sky-100 hover:text-sky-600'
                          }`}
                        >
                          {actionLoading === task.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-4 space-y-3">
                        {/* Add Note */}
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            <MessageSquare size={12} className="inline mr-1" />
                            Add Note
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="e.g., Read 5 pages..."
                              className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleComplete(task.id, true); }}
                              className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        </div>

                        {/* Missed Reason (M5) */}
                        {!task.isCompleted && (
                          <div>
                            <label className="text-xs font-semibold text-red-600 mb-1 block">
                              <AlertCircle size={12} className="inline mr-1" />
                              Why was this missed?
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={missedText}
                                onChange={(e) => setMissedText(e.target.value)}
                                placeholder="e.g., Overslept..."
                                className="flex-1 text-sm px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMissedReason(task.id); }}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </React.Fragment>
              );
            });
          })()
        )}
      </div>

      {/* Add Task FAB */}
      {!showAddTask && (
        <button
          onClick={() => setShowAddTask(true)}
          className="fixed bottom-6 right-6 lg:right-10 w-14 h-14 bg-gradient-to-br from-sky-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-sky-500/30 flex items-center justify-center hover:scale-110 transition-transform z-20"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddTask(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Task Name</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Morning Workout"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Start Time</label>
                  <input
                    type="time"
                    value={newTask.startTime}
                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">End Time</label>
                  <input
                    type="time"
                    value={newTask.endTime}
                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Category (optional)</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {Object.keys(categoryColors).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 btn-primary"
                  disabled={!newTask.name || !newTask.startTime || !newTask.endTime}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
