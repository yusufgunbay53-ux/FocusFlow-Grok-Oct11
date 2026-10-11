import { useState } from 'react';
import { Plus, GripVertical, Edit2, Trash2, Check } from 'lucide-react';
import { Task, Priority } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const columns = [
  { id: 'todo', title: 'Yapılacaklar', color: 'border-neon/50' },
  { id: 'inprogress', title: 'Yapılıyor', color: 'border-yellow-400/50' },
  { id: 'done', title: 'Tamamlandı', color: 'border-green-400/50' },
];

function TaskCard({ task, onEdit, onDelete, onToggle }: { task: Task; onEdit: (t: Task) => void; onDelete: (id: string) => void; onToggle: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    high: 'bg-red-500/20 text-red-300',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass p-4 mb-3 group hover:border-neon/40 transition-all duration-200"
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-1 text-white/40 hover:text-neon cursor-grab">
          <GripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={() => onToggle(task.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.status === 'done' ? 'bg-neon border-neon' : 'border-white/30 hover:border-neon'}`}>
              {task.status === 'done' && <Check size={14} className="text-night" />}
            </button>
            <h3 className={`font-medium truncate ${task.status === 'done' ? 'line-through text-white/50' : ''}`}>{task.title}</h3>
          </div>
          {task.description && <p className="text-sm text-white/60 mt-1 ml-7">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 ml-7">
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority === 'low' ? 'Düşük' : task.priority === 'medium' ? 'Orta' : 'Yüksek'}
            </span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1 hover:text-neon"><Edit2 size={14} /></button>
          <button onClick={() => onDelete(task.id)} className="p-1 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow-tasks', []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as Priority });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const addOrUpdate = () => {
    if (!form.title.trim()) return;
    if (editing) {
      setTasks(tasks.map(t => t.id === editing.id ? { ...t, ...form } : t));
      setEditing(null);
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: 'todo',
        createdAt: Date.now(),
      };
      setTasks([newTask, ...tasks]);
    }
    setForm({ title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const isDone = t.status === 'done';
      return {
        ...t,
        status: isDone ? 'todo' : 'done',
        completedAt: isDone ? undefined : Date.now(),
      };
    }));
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Determine new status from over column
    const overColumn = columns.find(c => c.id === over.id) || columns.find(c => tasks.filter(t => t.status === c.id).some(t => t.id === over.id));
    if (!overColumn) return;

    setTasks(tasks.map(t => t.id === active.id ? { ...t, status: overColumn.id as any } : t));
  };

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-neon to-blue-400 bg-clip-text text-transparent">Görevler</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', description: '', priority: 'medium' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-neon text-night rounded-xl font-medium hover:brightness-110 transition neon-glow"
        >
          <Plus size={18} /> Yeni Görev
        </button>
      </div>

      {showForm && (
        <div className="glass p-6 space-y-4">
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon"
            placeholder="Görev başlığı..."
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon resize-none"
            placeholder="Açıklama (opsiyonel)"
            rows={2}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3">
            {(['low', 'medium', 'high'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setForm({ ...form, priority: p })}
                className={`px-4 py-2 rounded-xl border transition ${form.priority === p ? 'border-neon bg-neon/20 text-neon' : 'border-white/20'}`}
              >
                {p === 'low' ? 'Düşük' : p === 'medium' ? 'Orta' : 'Yüksek'}
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl hover:bg-white/10">İptal</button>
            <button onClick={addOrUpdate} className="px-6 py-2 bg-neon text-night rounded-xl font-medium">Kaydet</button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => (
            <div key={col.id} className={`glass p-4 min-h-[400px] border-t-4 ${col.color}`}>
              <h3 className="font-semibold mb-4 flex items-center justify-between">
                {col.title}
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{getColumnTasks(col.id).length}</span>
              </h3>
              <SortableContext items={getColumnTasks(col.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div id={col.id} className="space-y-2 min-h-[200px]">
                  {getColumnTasks(col.id).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => { setEditing(t); setForm({ title: t.title, description: t.description || '', priority: t.priority }); setShowForm(true); }}
                      onDelete={deleteTask}
                      onToggle={toggleComplete}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeId ? <div className="glass p-4 opacity-80">Sürükleniyor...</div> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
