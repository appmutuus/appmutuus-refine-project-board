import { useEffect, useState } from 'react';

interface JobTimerProps {
  deadline: Date;
}

export function JobTimer({ deadline }: JobTimerProps) {
  const [remaining, setRemaining] = useState(() => deadline.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(deadline.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (remaining <= 0) {
    return <span className="text-red-600" role="status">Expired</span>;
  }

  const seconds = Math.floor((remaining / 1000) % 60);
  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const hours = Math.floor(remaining / 1000 / 60 / 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <span aria-label="time remaining">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

export default JobTimer;
