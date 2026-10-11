import { useMemo } from 'react';
import { Sparkles, Zap, Coffee } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Task, PomodoroSession } from '../types';

export default function AICoach() {
  const [tasks] = useLocalStorage<Task[]>('focusflow-tasks', []);
  const [sessions] = useLocalStorage<PomodoroSession[]>('focusflow-sessions', []);

  const insight = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayTasks = tasks.filter(t => t.completedAt && t.completedAt >= today);
    const todaySessions = sessions.filter(s => s.completedAt >= today && s.type === 'work');

    if (todayTasks.length >= 5 || todaySessions.length >= 4) {
      return {
        icon: Sparkles,
        message: "Bugün harika gidiyorsun! Odaklanma seviyen çok yüksek. Bu tempoyu koru!",
        color: "text-neon",
      };
    }
    if (todayTasks.length === 0 && todaySessions.length === 0) {
      return {
        icon: Coffee,
        message: "Güne başlamak için küçük bir görev seç ve bir Pomodoro başlat. İlk adım en önemlisi!",
        color: "text-blue-300",
      };
    }
    if (todaySessions.length >= 2 && todayTasks.length < 2) {
      return {
        icon: Zap,
        message: "Biraz yavaşladın. 5 dakika mola verip ardından en yüksek öncelikli göreve odaklanmak ister misin?",
        color: "text-yellow-300",
      };
    }
    return {
      icon: Sparkles,
      message: "İyi gidiyorsun! Her tamamlanan görev seni hedefe bir adım daha yaklaştırıyor.",
      color: "text-green-300",
    };
  }, [tasks, sessions]);

  const Icon = insight.icon;

  return (
    <div className="glass p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-neon/20 flex items-center justify-center">
          <Icon size={18} className={insight.color} />
        </div>
        <h3 className="font-semibold">AI Performans Koçu</h3>
      </div>
      <p className="text-sm text-white/80 leading-relaxed">{insight.message}</p>
      <div className="text-xs text-white/40">
        Bugün: {tasks.filter(t => t.completedAt && t.completedAt >= new Date().setHours(0,0,0,0)).length} görev • {sessions.filter(s => s.completedAt >= new Date().setHours(0,0,0,0) && s.type === 'work').length} pomodoro
      </div>
    </div>
  );
}
