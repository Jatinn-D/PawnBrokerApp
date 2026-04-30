/**
 * Converts a number to Indian English words
 * e.g. 100000 → "One Lakh Rupees Only"
 */
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n) {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
}

function threeDigits(n) {
  if (n >= 100) {
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : '');
  }
  return twoDigits(n);
}

export function numberToWords(amount) {
  const n = Math.floor(parseFloat(amount) || 0);
  if (n === 0) return 'Zero Rupees Only';

  const crore   = Math.floor(n / 10000000);
  const lakh    = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest    = n % 1000;

  let words = '';
  if (crore)    words += threeDigits(crore) + ' Crore ';
  if (lakh)     words += threeDigits(lakh) + ' Lakh ';
  if (thousand) words += threeDigits(thousand) + ' Thousand ';
  if (rest)     words += threeDigits(rest);

  return words.trim() + ' Rupees Only';
}

/** Format number with Indian comma system, no ₹ prefix */
export function fmtIndian(n) {
  if (!n && n !== 0) return '';
  const num = Math.round(parseFloat(n));
  const s = String(num);
  const lastThree = s.slice(-3);
  const rest = s.slice(0, -3);
  return (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + lastThree;
}

/** Split grams into whole grams and milligrams (3 decimal places)
 *  e.g. 12.500 → { gm: '12', mg: '500' }
 *       8.3    → { gm: '8',  mg: '300' }
 */
export function splitWeight(wt) {
  const n = parseFloat(wt) || 0;
  const gm = Math.floor(n);
  const mg = Math.round((n - gm) * 1000);
  return { gm: String(gm), mg: mg > 0 ? String(mg).padEnd(3, '0') : '000' };
}
