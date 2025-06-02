export function formatCAD(input: number | string): string {
  let num: number;
  let originalHasDecimals = false;
  
  if (typeof input === 'string') {
    originalHasDecimals = input.includes('.');
    num = parseFloat(input);
  } else {
    originalHasDecimals = input % 1 !== 0;
    num = input;
  }
  
  if (isNaN(num)) return 'CA$ 0';

  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'decimal',
    minimumFractionDigits: originalHasDecimals ? 2 : 0,
    maximumFractionDigits: originalHasDecimals ? 2 : 0
  }).format(num);

  return `CA$ ${formatted}`;
}