// Multi-currency display. Base/store currency is SAR (Saudi Riyal) per project
// taste. Customer-facing prices also show equivalent AED and EGP so shoppers
// in the UAE and Egypt can see what they'd pay in their own currency.

const FX_FROM_SAR = {
  SAR: 1,
  AED: 0.98,
  EGP: 13.39,
};

const SYMBOLS = {
  SAR: '\u0631.\u0633',
  AED: '\u062f.\u0625',
  EGP: '\u062c.\u0645',
};

function convertFromSAR(amountSAR: number, target: 'SAR' | 'AED' | 'EGP'): number {
  return amountSAR * (FX_FROM_SAR[target] || 1);
}

function formatOne(amount: number, currency: 'SAR' | 'AED' | 'EGP', locale: string): string {
  const symbol = SYMBOLS[currency] || currency;
  const value = amount.toFixed(2);
  if (locale === 'ar') {
    return value + ' ' + symbol;
  }
  return symbol + ' ' + value;
}

export function formatPriceMulti(amountSAR: number, locale: string = 'en'): string {
  const sar = formatOne(convertFromSAR(amountSAR, 'SAR'), 'SAR', locale);
  const aed = formatOne(convertFromSAR(amountSAR, 'AED'), 'AED', locale);
  const egp = formatOne(convertFromSAR(amountSAR, 'EGP'), 'EGP', locale);
  return sar + '  \u00b7  ' + aed + '  \u00b7  ' + egp;
}
