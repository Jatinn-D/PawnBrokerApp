/** Format a date string YYYY-MM-DD → DD-MM-YYYY */
export const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = String(d).split('T')[0].split('-');
  return `${day}-${m}-${y}`;
};

/** Format a time string HH:MM:SS → HH:MM AM/PM */
export const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  return `${hr % 12 || 12}:${m} ${ampm}`;
};

/** Format number with Indian comma system */
export const fmtINR = (n) => {
  if (n === null || n === undefined || n === '') return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  const [int, dec] = num.toFixed(0).split('.');
  const lastThree = int.slice(-3);
  const rest = int.slice(0, -3);
  const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return '₹ ' + formatted;
};

/** Format weight → "12.500 gm" */
export const fmtWeight = (w) => {
  if (!w && w !== 0) return '—';
  return parseFloat(w).toFixed(3) + ' gm';
};

/** Months elapsed from a date to today (min 0) */
export const monthsElapsed = (dateStr) => {
  if (!dateStr) return 0;
  const from = new Date(dateStr);
  const now = new Date();
  const months =
    (now.getFullYear() - from.getFullYear()) * 12 +
    now.getMonth() - from.getMonth() -
    (now.getDate() < from.getDate() ? 1 : 0);
  return Math.max(0, months);
};

/** Status colour config */
export const statusConfig = {
  active:   { label: 'Active',   bg: '#EAF4FB', color: '#1a5276', dot: '#2471A3' },
  released: { label: 'Released', bg: '#FEF0F0', color: '#922b21', dot: '#C0392B' },
  renewed:  { label: 'Renewed',  bg: '#EEF5FF', color: '#1a3a6b', dot: '#3455a4' },
};

/** Row background by status */
export const rowBg = (status) => {
  if (status === 'released') return '#FFF8F8';
  if (status === 'renewed')  return '#F8FAFF';
  return '#fff';
};
