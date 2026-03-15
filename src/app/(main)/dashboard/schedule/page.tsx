'use client';

import { useState, useEffect, useRef } from 'react';
import { scheduleApi, tasksApi } from '@/lib/api';
import { format, addDays, subDays, isToday } from 'date-fns';
import {
  Upload, Plus, Trash2, Clock, Tag, CalendarDays,
  FileText, AlertCircle, CheckCircle2, Loader2, X, Edit2, Trash, ChevronLeft, ChevronRight
} from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  category?: string;
  description?: string;
  daysOfWeek: string[];
}

interface TaskInstance {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  category?: string;
  description?: string;
  isCompleted: boolean;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function SchedulePage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [dailyTasks, setDailyTasks] = useState<TaskInstance[]>([]);
  const [taskDate, setTaskDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({
    name: '', startTime: '', endTime: '', category: '', description: '',
  });
  const [newTemplate, setNewTemplate] = useState({
    name: '', startTime: '', endTime: '', category: '', description: '', daysOfWeek: [] as string[],
  });
  const [dragOver, setDragOver] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadTemplates(); }, []);
  useEffect(() => { loadDailyTasks(); }, [taskDate]);

  const selectedTaskDate = format(taskDate, 'yyyy-MM-dd');

  const loadTemplates = async () => {
    try {
      const res = await scheduleApi.getTemplates();
      setTemplates(res.data.templates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyTasks = async () => {
    setTaskLoading(true);
    try {
      const response = isToday(taskDate)
        ? await tasksApi.getToday()
        : await tasksApi.getByDate(selectedTaskDate);
      setDailyTasks(response.data.tasks || []);
    } catch (err) {
      console.error('Failed to load daily tasks:', err);
      setError('Failed to load daily tasks');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadMessage('');
    setError('');
    try {
      const response = await scheduleApi.uploadCSV(file);
      setUploadMessage(response.data.message);
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFileUpload(file);
    else setError('Please upload a .csv file');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task template?')) return;
    try {
      await scheduleApi.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) { alert('Failed to delete template'); }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Delete all ${templates.length} templates? This cannot be undone.`)) return;
    try {
      const result = await scheduleApi.deleteAllTemplates();
      setTemplates([]);
      setUploadMessage(result.data.message);
    } catch (err) {
      setError('Failed to delete all templates');
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      startTime: template.startTime,
      endTime: template.endTime,
      category: template.category || '',
      description: template.description || '',
      daysOfWeek: template.daysOfWeek,
    });
    setShowAddForm(true);
    
    // Smooth scroll to form with a slight delay to ensure form is rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
      });
    }, 50);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.startTime || !newTemplate.endTime) return;
    try {
      if (editingTemplate) {
        await scheduleApi.updateTemplate(editingTemplate.id, {
          name: newTemplate.name,
          startTime: newTemplate.startTime,
          endTime: newTemplate.endTime,
          category: newTemplate.category || undefined,
          description: newTemplate.description || undefined,
          daysOfWeek: newTemplate.daysOfWeek.join(',') || undefined,
        });
        setUploadMessage('Template updated successfully');
      } else {
        await scheduleApi.createTemplate({
          name: newTemplate.name,
          startTime: newTemplate.startTime,
          endTime: newTemplate.endTime,
          category: newTemplate.category || undefined,
          description: newTemplate.description || undefined,
          daysOfWeek: newTemplate.daysOfWeek.join(',') || undefined,
        });
        setUploadMessage('Template created successfully');
      }
      setNewTemplate({ name: '', startTime: '', endTime: '', category: '', description: '', daysOfWeek: [] });
      setShowAddForm(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${editingTemplate ? 'update' : 'create'} template`);
    }
  };

  const toggleDay = (day: string) => {
    setNewTemplate(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleEditTask = (task: TaskInstance) => {
    setEditingTaskId(task.id);
    setTaskForm({
      name: task.name,
      startTime: task.startTime,
      endTime: task.endTime,
      category: task.category || '',
      description: task.description || '',
    });
  };

  const handleUpdateTask = async () => {
    if (!editingTaskId || !taskForm.name || !taskForm.startTime || !taskForm.endTime) {
      return;
    }

    try {
      await tasksApi.updateTask(editingTaskId, {
        name: taskForm.name,
        startTime: taskForm.startTime,
        endTime: taskForm.endTime,
        category: taskForm.category || undefined,
        description: taskForm.description || undefined,
      });

      setDailyTasks(prev => prev.map(task => (
        task.id === editingTaskId
          ? {
              ...task,
              name: taskForm.name,
              startTime: taskForm.startTime,
              endTime: taskForm.endTime,
              category: taskForm.category || undefined,
              description: taskForm.description || undefined,
            }
          : task
      )));

      setEditingTaskId(null);
      setTaskForm({ name: '', startTime: '', endTime: '', category: '', description: '' });
      setUploadMessage('Task updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task instance for this date?')) return;

    try {
      await tasksApi.deleteTask(taskId);
      setDailyTasks(prev => prev.filter(task => task.id !== taskId));
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
      setUploadMessage('Task deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleDeleteAllDailyTasks = async () => {
    if (dailyTasks.length === 0) return;

    const dateLabel = isToday(taskDate) ? 'today' : format(taskDate, 'MMMM d, yyyy');
    if (!confirm(`Delete all ${dailyTasks.length} tasks for ${dateLabel}?`)) return;

    try {
      const response = await tasksApi.deleteTasksByDate(selectedTaskDate);
      setDailyTasks([]);
      setEditingTaskId(null);
      setUploadMessage(response.data.message || 'All tasks deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete all tasks for this date');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your recurring task templates
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) {
              setEditingTemplate(null);
              setNewTemplate({ name: '', startTime: '', endTime: '', category: '', description: '', daysOfWeek: [] });
            }
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Cancel' : 'Add Template'}
        </button>
      </div>

      {/* Alert Messages */}
      {uploadMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
          <CheckCircle2 size={20} />
          <span className="text-sm font-medium">{uploadMessage}</span>
          <button onClick={() => setUploadMessage('')} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Add Template Form */}
      {showAddForm && (
        <div 
          ref={formRef}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 scroll-mt-6 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingTemplate ? 'Edit Task Template' : 'New Task Template'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Name *</label>
              <input type="text" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} className="input-field" placeholder="e.g., Morning Prayer" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Start Time *</label>
              <input type="time" value={newTemplate.startTime} onChange={e => setNewTemplate({...newTemplate, startTime: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">End Time *</label>
              <input type="time" value={newTemplate.endTime} onChange={e => setNewTemplate({...newTemplate, endTime: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
              <input type="text" value={newTemplate.category} onChange={e => setNewTemplate({...newTemplate, category: e.target.value})} className="input-field" placeholder="e.g., Spiritual" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <input type="text" value={newTemplate.description} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} className="input-field" placeholder="Optional details" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Days (empty = every day)</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    newTemplate.daysOfWeek.includes(day)
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSaveTemplate} disabled={!newTemplate.name || !newTemplate.startTime || !newTemplate.endTime} className="btn-primary mt-4 disabled:opacity-50">
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      )}

      {/* CSV Upload */}
      <div
        onDragOver={e => { e.preventDefault(); if (!uploading) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`bg-white rounded-2xl shadow-sm border-2 border-dashed transition-all p-8 text-center relative ${
          uploading 
            ? 'border-sky-400 bg-sky-50/50 pointer-events-none' 
            : dragOver 
              ? 'border-sky-400 bg-sky-50' 
              : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin text-sky-500 mx-auto mb-3" />
              <p className="text-base font-semibold text-sky-600">Uploading CSV...</p>
              <p className="text-sm text-slate-500 mt-1">Processing your schedule</p>
            </div>
          </div>
        )}
        
        <Upload size={40} className={`mx-auto mb-3 transition-all ${
          uploading ? 'text-sky-400 opacity-50' : dragOver ? 'text-sky-500' : 'text-slate-300'
        }`} />
        <h3 className="text-base font-semibold text-slate-700 mb-1">
          Upload Schedule CSV
        </h3>
        <p className="text-sm text-slate-500 mb-4">Drag & drop or click to browse</p>
        <label className={`btn-secondary inline-flex items-center gap-2 ${
          uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}>
          <FileText size={16} />
          Choose File
          <input type="file" accept=".csv" className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
            e.target.value = '';
          }} disabled={uploading} />
        </label>
        <div className="mt-4 bg-slate-50 rounded-xl p-6 text-left max-w-lg mx-auto border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <FileText size={16} className="text-sky-500" />
            CSV Formatting Guide
          </h4>
          
          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <p className="font-medium text-slate-700 mb-1">Required Columns:</p>
              <code className="bg-white px-2 py-1 rounded border border-slate-200 block text-slate-500 font-mono">
                name, startTime, endTime
              </code>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-1">Optional Columns:</p>
              <code className="bg-white px-2 py-1 rounded border border-slate-200 block text-slate-500 font-mono">
                category, description, daysOfWeek
              </code>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-1">Example Row:</p>
              <code className="bg-white px-2 py-2 rounded border border-slate-200 block text-slate-500 font-mono overflow-x-auto whitespace-pre">
                Prayer,06:00,06:15,Spiritual,Morning Prayer,"MON,WED,FRI"
              </code>
              <code className="bg-white px-2 py-2 rounded border border-slate-200 block text-slate-500 font-mono overflow-x-auto whitespace-pre mt-1">
                Deep Work,09:00,11:30,Work,Focus time,
              </code>
            </div>

            <div className="bg-sky-50 p-3 rounded-lg border border-sky-100">
              <p className="font-medium text-sky-800 mb-1">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-sky-700">
                <li>Time format must be 24-hour <span className="font-mono bg-sky-100 px-1 rounded">HH:MM</span> (e.g., 14:30)</li>
                <li>Days must be 3-letter codes (MON, TUE, etc.)</li>
                <li>Leave <span className="font-mono bg-sky-100 px-1 rounded">daysOfWeek</span> empty for daily tasks</li>
                <li>Wrap fields in quotes if they contain commas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Task Instances */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Daily Tasks
              <span className="ml-2 text-sm font-normal text-slate-400">({dailyTasks.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              {dailyTasks.length > 0 && (
                <button
                  onClick={handleDeleteAllDailyTasks}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Delete All Tasks
                </button>
              )}
              <button
                onClick={loadDailyTasks}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setTaskDate(subDays(taskDate, 1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">
                {isToday(taskDate) ? 'Today' : format(taskDate, 'EEEE')}
              </p>
              <p className="text-xs text-slate-500">{format(taskDate, 'MMMM d, yyyy')}</p>
            </div>

            <button
              onClick={() => setTaskDate(addDays(taskDate, 1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {taskLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-sky-500" />
          </div>
        ) : dailyTasks.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No task instances for this date</p>
            <p className="text-sm text-slate-400">Tasks will auto-generate from templates when available</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {dailyTasks.map((task) => (
              <div key={task.id} className="p-4 sm:px-6">
                {editingTaskId === task.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={taskForm.name}
                        onChange={e => setTaskForm({ ...taskForm, name: e.target.value })}
                        className="input-field"
                        placeholder="Task name"
                      />
                      <input
                        type="text"
                        value={taskForm.category}
                        onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}
                        className="input-field"
                        placeholder="Category"
                      />
                      <input
                        type="time"
                        value={taskForm.startTime}
                        onChange={e => setTaskForm({ ...taskForm, startTime: e.target.value })}
                        className="input-field"
                      />
                      <input
                        type="time"
                        value={taskForm.endTime}
                        onChange={e => setTaskForm({ ...taskForm, endTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <input
                      type="text"
                      value={taskForm.description}
                      onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="input-field"
                      placeholder="Description"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUpdateTask}
                        className="btn-primary py-2 px-4"
                        disabled={!taskForm.name || !taskForm.startTime || !taskForm.endTime}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{task.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{task.startTime} - {task.endTime}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {task.category && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">
                            {task.category}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${task.isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {task.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-500 mt-2">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Templates
            <span className="ml-2 text-sm font-normal text-slate-400">({templates.length})</span>
          </h2>
          {templates.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash size={14} />
              Delete All
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-sky-500" />
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No templates yet</p>
            <p className="text-sm text-slate-400">Upload a CSV or add templates manually</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {templates.map((t) => (
              <div key={t.id} className="p-4 sm:px-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900">{t.name}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                        <Clock size={10} />
                        {t.startTime} - {t.endTime}
                      </span>
                      {t.category && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                          <Tag size={10} />
                          {t.category}
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-sm text-slate-500 mb-1">{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.daysOfWeek.length > 0 ? t.daysOfWeek.map(d => (
                        <span key={d} className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                          {d}
                        </span>
                      )) : (
                        <span className="text-xs text-slate-400">Every day</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
