import { useState } from 'react';
import { LayoutDashboard, Timer, Sparkles } from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import PomodoroTimer from './components/PomodoroTimer';
import AmbientPlayer from './components/AmbientPlayer';
import AICoach from './components/AICoach';

type Tab = 'tasks' | 'focus' | 'ai';

export default function App() {
  const [tab, setTab] = useState<Tab>('tasks');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Focus<span className="text-neon">Flow</span>
          </h1>
          <p className="text-white/60 mt-1">AI Destekli Görev ve Odaklanma Asistanı</p>
        </div>
        <div className="flex gap-2 glass p-1 rounded-2xl">
          <button
            onClick={() => setTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${tab === 'tasks' ? 'bg-neon text-night' : 'hover:bg-white/10'}`}
          >
            <LayoutDashboard size={18} /> Görevler
          </button>
          <button
            onClick={() => setTab('focus')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${tab === 'focus' ? 'bg-neon text-night' : 'hover:bg-white/10'}`}
          >
            <Timer size={18} /> Odaklanma
          </button>
          <button
            onClick={() => setTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${tab === 'ai' ? 'bg-neon text-night' : 'hover:bg-white/10'}`}
          >
            <Sparkles size={18} /> AI Koç
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {tab === 'tasks' && <KanbanBoard />}
        {tab === 'focus' && (
          <div className="grid md:grid-cols-2 gap-6">
            <PomodoroTimer />
            <div className="space-y-4">
              <AmbientPlayer />
              <AICoach />
            </div>
          </div>
        )}
        {tab === 'ai' && (
          <div className="max-w-md mx-auto">
            <AICoach />
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-xs text-white/30">
        FocusFlow • localStorage ile çalışır • Gelecekte Supabase/Firebase'e hazır
      </footer>
    </div>
  );
}
