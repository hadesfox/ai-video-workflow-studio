import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioWaveformProps {
  url: string;
  color?: string;
  height?: number;
  barCount?: number;
}

// 音乐/音效波形：Web Audio API 解码音频 → Canvas 绘制柱状波形，点击任意位置跳转播放
const AudioWaveform: React.FC<AudioWaveformProps> = ({
  url,
  color = '#3b82f6',
  height = 36,
  barCount = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingSeek = useRef<number | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // 解码音频并提取每根柱子的峰值
  useEffect(() => {
    let cancelled = false;
    setPeaks(null);
    setFailed(false);
    setProgress(0);
    setPlaying(false);

    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`fetch ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        try {
          const buffer = await ctx.decodeAudioData(arrayBuffer);
          const data = buffer.getChannelData(0);
          const bucket = Math.max(1, Math.floor(data.length / barCount));
          const raw: number[] = [];
          for (let i = 0; i < barCount; i++) {
            let max = 0;
            const start = i * bucket;
            const end = Math.min(start + bucket, data.length);
            for (let j = start; j < end; j++) {
              const v = Math.abs(data[j]);
              if (v > max) max = v;
            }
            raw.push(max);
          }
          const normMax = Math.max(...raw, 0.0001);
          if (!cancelled) setPeaks(raw.map(v => v / normMax));
        } finally {
          ctx.close();
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [url, barCount]);

  // 绘制波形（已播放部分高亮）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const gap = 1;
      const barWidth = Math.max(1, (rect.width - gap * (peaks.length - 1)) / peaks.length);
      const centerY = rect.height / 2;
      const playedColor = color;
      const restColor = 'rgba(148, 163, 184, 0.35)';

      peaks.forEach((p, i) => {
        const barHeight = Math.max(2, p * (rect.height - 2));
        const x = i * (barWidth + gap);
        const y = centerY - barHeight / 2;
        ctx.fillStyle = i / peaks.length <= progress ? playedColor : restColor;
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [peaks, progress, color, height]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (isFinite(audio.duration) && audio.currentTime >= audio.duration) audio.currentTime = 0;
      audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || !peaks) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = ratio * audio.duration;
      setProgress(ratio);
      audio.play();
    } else {
      pendingSeek.current = ratio;
    }
  };

  // 跨域或解码失败时，降级为原生播放器
  if (failed) {
    return <audio ref={audioRef} src={url} controls className="w-full h-8" preload="metadata" />;
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={togglePlay}
        className="shrink-0 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        title={playing ? '暂停' : '播放'}
      >
        {playing ? <Pause size={13} /> : <Play size={13} />}
      </button>
      {peaks ? (
        <canvas
          ref={canvasRef}
          onClick={handleSeek}
          className="flex-1 cursor-pointer min-w-0"
          style={{ height }}
          title="点击波形跳转播放"
        />
      ) : (
        <div className="flex-1 h-9 bg-slate-800/40 rounded-md animate-pulse" />
      )}
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio && isFinite(audio.duration) && audio.duration > 0) {
            setProgress(audio.currentTime / audio.duration);
          }
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && pendingSeek.current !== null && isFinite(audio.duration)) {
            audio.currentTime = pendingSeek.current * audio.duration;
            pendingSeek.current = null;
            audio.play();
          }
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
    </div>
  );
};

export default AudioWaveform;
