import { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

const tracks = [
  { name: 'Lo-Fi Chill', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { name: 'Yağmur Sesi', url: 'https://cdn.pixabay.com/audio/2021/08/09/audio_12b0c7443c.mp3' },
  { name: 'Kahve Dükkanı', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3' },
];

export default function AmbientPlayer() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
    }
  }, [volume]);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(tracks[current].url);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const changeTrack = (i: number) => {
    setCurrent(i);
    if (audioRef.current) {
      audioRef.current.src = tracks[i].url;
      if (playing) audioRef.current.play();
    }
  };

  return (
    <div className="glass p-4 flex items-center gap-4">
      <button onClick={toggle} className="w-10 h-10 rounded-full bg-neon/20 text-neon flex items-center justify-center hover:bg-neon hover:text-night transition">
        <Music size={18} />
      </button>
      <div className="flex-1">
        <div className="text-sm font-medium">{tracks[current].name}</div>
        <div className="flex gap-2 mt-1">
          {tracks.map((t, i) => (
            <button key={i} onClick={() => changeTrack(i)} className={`text-xs px-2 py-1 rounded ${current === i ? 'bg-neon/30 text-neon' : 'bg-white/10'}`}>
              {t.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="w-20 accent-neon"
        />
      </div>
    </div>
  );
}
