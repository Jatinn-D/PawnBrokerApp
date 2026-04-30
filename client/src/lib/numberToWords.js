// Converts a number to Indian currency words
// e.g. 150000 → "One Lakh Fifty Thousand Rupees Only"

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
  if (!amount && amount !== 0) return '';
  const n = Math.round(parseFloat(amount));
  if (n === 0) return 'Zero Rupees Only';

  let remaining = n;
  let result = '';

  const crore = Math.floor(remaining / 10000000);
  remaining = remaining % 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining = remaining % 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining = remaining % 1000;

  const hundred = Math.floor(remaining / 100);
  remaining = remaining % 100;

  if (crore) result += threeDigits(crore) + ' Crore ';
  if (lakh)  result += twoDigits(lakh) + ' Lakh ';
  if (thousand) result += twoDigits(thousand) + ' Thousand ';
  if (hundred) result += ones[hundred] + ' Hundred ';
  if (remaining) result += twoDigits(remaining) + ' ';

  return result.trim() + ' Rupees Only';
}
