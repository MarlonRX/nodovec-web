export function formatRate(rate: string | number): string {
  const num = Number(rate);
  if (isNaN(num)) return "0%";
  return `${num.toFixed(2)}%`;
}

export function getNextPaymentDate(
  firstPaymentDate: string,
  frequency: string,
  currentInstallment: number,
): string | null {
  if (!firstPaymentDate || !currentInstallment) return null;
  const date = new Date(firstPaymentDate + 'T00:00:00');
  const offset = currentInstallment - 1;
  switch (frequency) {
    case 'weekly': date.setDate(date.getDate() + offset * 7); break;
    case 'biweekly': date.setDate(date.getDate() + offset * 14); break;
    default: date.setMonth(date.getMonth() + offset); break;
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}
