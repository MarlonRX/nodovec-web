import Decimal from "decimal.js";

export function calculateInstallment(total: string | number, installments: string | number, annualRate: string | number): Decimal {
  const amount = new Decimal(total || 0);
  const count = new Decimal(installments || 0);
  const rate = new Decimal(annualRate || 0).dividedBy(1200);

  if (amount.isZero() || count.isZero()) return new Decimal(0);
  if (rate.isZero()) return amount.dividedBy(count);

  const factor = rate.plus(1).pow(count.toNumber());
  return amount.times(rate).times(factor).dividedBy(factor.minus(1));
}

export function money(value: string | number | null | undefined): Decimal {
  return new Decimal(value || 0);
}

export function formatMoney(value: Decimal | string | number): string {
  return new Decimal(value).toDecimalPlaces(2).toFixed(2);
}
