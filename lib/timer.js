export function calculateRemaining(startTime, duration) {
  const end = new Date(startTime.getTime() + duration * 60000);
  return end.getTime() - Date.now();
}

export function formatTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function startTimer(startTime, duration, onExpire) {
  const interval = setInterval(() => {
    const remaining = calculateRemaining(startTime, duration);
    if (remaining <= 0) {
      clearInterval(interval);
      if (typeof onExpire === 'function') {
        onExpire();
      }
    }
  }, 1000);
  return () => clearInterval(interval);
}
