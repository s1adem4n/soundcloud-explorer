export function formatPossiblyBigNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  if (num < 10000) {
    return num.toLocaleString('en-US');
  }
  if (num < 100000) {
    return `${parseFloat((num / 1000).toFixed(1))}k`;
  }
  if (num < 1000000) {
    return `${Math.floor(num / 1000)}k`;
  }

  return `${parseFloat((num / 1000000).toFixed(1))}m`;
}

export function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
