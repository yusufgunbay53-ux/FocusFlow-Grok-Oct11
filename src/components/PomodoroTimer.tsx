import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PomodoroSession } from '../types';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>('focusflow-sessions', []);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            // Notification
            if (Notification.permission === 'granted') {
              new Notification(isWork ? 'Odaklanma süresi bitti!' : 'Mola bitti!', {
                body: isWork ? 'Harika iş! Şimdi mola zamanı.' : 'Tekrar odaklanmaya hazır mısın?',
                icon: '/vite.svg'
              });
            }
            audioRef.current?.play().catch(() => {});
            // Record session
            const session: PomodoroSession = {
              id: crypto.randomUUID(),
              type: isWork ? 'work' : 'break',
              duration: isWork ? WORK_TIME : BREAK_TIME,
              completedAt: Date.now(),
            };
            setSessions([...sessions, session]);
            // Switch
            setIsWork(!isWork);
            setTimeLeft(isWork ? BREAK_TIME : WORK_TIME);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isWork, sessions]);

  const requestNotification = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = isWork ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100 : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="glass p-8 text-center space-y-6 neon-glow">
      <div className="flex justify-center items-center gap-2">
        <h2 className="text-2xl font-bold">{isWork ? 'Odaklanma' : 'Mola'}</h2>
        <button onClick={requestNotification} className="text-white/50 hover:text-neon" title="Bildirimleri aç">
          <Bell size={18} />
        </button>
      </div>

      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#00d2ff" strokeWidth="8"
            strokeDasharray={`${progress * 2.827} 282.7`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-mono font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-14 h-14 rounded-full bg-neon text-night flex items-center justify-center hover:scale-105 transition neon-glow"
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(isWork ? WORK_TIME : BREAK_TIME);
          }}
          className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
        >
          <RotateCcw size={22} />
        </button>
      </div>

      <p className="text-sm text-white/60">
        Tamamlanan oturumlar: {sessions.filter(s => s.type === 'work').length}
      </p>
    </div>
  );
}
