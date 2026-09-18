import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'attendance.today';

function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export async function getTodayAttendance() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;

  const data = JSON.parse(raw);
  if (data.date !== todayKey()) {
    await AsyncStorage.removeItem(KEY);
    return null;
  }
  return data;
}

export async function clockIn() {
  const existing = await getTodayAttendance();
  if (existing?.clockIn) return existing;

  const record = {
    date: todayKey(),
    clockIn: new Date().toISOString(),
    clockOut: null,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(record));
  return record;
}

export async function clockOut() {
  const record = await getTodayAttendance();
  if (!record?.clockIn || record.clockOut) return record;

  const updated = { ...record, clockOut: new Date().toISOString() };
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function formatClockTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDuration(startIso, endIso) {
  const mins = Math.max(0, Math.round((new Date(endIso) - new Date(startIso)) / 60000));
  const hrs = Math.floor(mins / 60);
  const left = mins % 60;

  if (!hrs) return `${left} min`;
  if (!left) return `${hrs} hr`;
  return `${hrs} hr ${left} min`;
}
