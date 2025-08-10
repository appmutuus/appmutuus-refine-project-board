const rateMap = new Map();
const dedupeMap = new Map();

const TZ = process.env.EUROPE_TZ || 'Europe/Berlin';

function minutesFromTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function getParts(date) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const obj = {};
  for (const p of parts) obj[p.type] = parseInt(p.value, 10);
  return obj;
}

function zoneOffset(date) {
  return (new Date(date.toLocaleString('en-US', { timeZone: TZ })).getTime() - date.getTime()) / 60000;
}

export function inQuietHours(date, settings) {
  const p = getParts(date);
  const now = p.hour * 60 + p.minute;
  const start = minutesFromTime(settings.quiet_hours_start);
  const end = minutesFromTime(settings.quiet_hours_end);
  if (start < end) {
    return now >= start && now < end;
  }
  return now >= start || now < end;
}

export function nextSendTime(date, settings) {
  const p = getParts(date);
  const endMinutes = minutesFromTime(settings.quiet_hours_end);
  const [endH, endM] = settings.quiet_hours_end.split(':').map(Number);
  let day = p.day;
  const now = p.hour * 60 + p.minute;
  if (now >= endMinutes) day += 1;
  const base = new Date(Date.UTC(p.year, p.month - 1, day, endH, endM));
  const offset = zoneOffset(base);
  const utc = base.getTime() - offset * 60000 + 30 * 60000;
  return new Date(utc);
}

export function checkRateLimit(userId, priority, now = new Date(), limitMinutes = 10) {
  if (priority === 'critical') return true;
  const last = rateMap.get(userId) || 0;
  const diff = now.getTime() - last;
  if (diff >= limitMinutes * 60 * 1000) {
    rateMap.set(userId, now.getTime());
    return true;
  }
  return false;
}

export function resetRateLimit() {
  rateMap.clear();
}

export function checkDedupe(key, now = Date.now(), ttlMs = 30 * 60 * 1000) {
  const exp = dedupeMap.get(key);
  if (exp && exp > now) {
    return false;
  }
  dedupeMap.set(key, now + ttlMs);
  return true;
}

export function resetDedupe() {
  dedupeMap.clear();
}
