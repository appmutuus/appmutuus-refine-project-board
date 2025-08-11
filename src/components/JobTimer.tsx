import { useState, useEffect } from 'react';
import { calculateRemaining, formatTime } from '../../lib/timer.js';

interface TimerProps {
  startTime: Date;
  duration: number; // minutes
  mode: 'countdown' | 'elapsed';
  onExpire?: () => void;
}

export function JobTimer({ startTime, duration, mode, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(() => calculateRemaining(startTime, duration));

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemaining = calculateRemaining(startTime, duration);
      setRemaining(newRemaining);
      if (newRemaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, duration, onExpire]);

  const display = mode === 'countdown'
    ? formatTime(Math.max(0, remaining))
    : formatTime(duration * 60000 - remaining);

  return (
    <div className={`timer ${remaining <= 0 ? 'text-red-500' : 'text-green-500'}`}>{display}</div>
  );
}

export function ProgressBar({ elapsedTime, totalTime }: { elapsedTime: number; totalTime: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${(elapsedTime / totalTime) * 100}%` }}
      />
    </div>
  );
}

export default JobTimer;
