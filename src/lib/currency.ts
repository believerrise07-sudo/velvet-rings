export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number; // rate relative to 1 INR (multiplied to INR amount)
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", rate: 1.0, name: "Indian Rupee" },
  { code: "USD", symbol: "$", rate: 0.012, name: "US Dollar" },
  { code: "EUR", symbol: "€", rate: 0.011, name: "Euro" },
  { code: "GBP", symbol: "£", rate: 0.0094, name: "British Pound" },
  { code: "AUD", symbol: "A$", rate: 0.018, name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", rate: 0.016, name: "Canadian Dollar" },
  { code: "JPY", symbol: "¥", rate: 1.88, name: "Japanese Yen" },
  { code: "AED", symbol: "Dhs", rate: 0.044, name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", rate: 0.016, name: "Singapore Dollar" }
];

export function getSelectedCurrency(): CurrencyInfo {
  const code = localStorage.getItem("velvet_selected_currency") || "INR";
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export function setSelectedCurrency(code: string) {
  localStorage.setItem("velvet_selected_currency", code);
  // Dispatch a custom event to notify all components to re-render when currency changes!
  window.dispatchEvent(new Event("velvet_currency_changed"));
}

export function formatPrice(priceInINR: number, currency: CurrencyInfo): string {
  if (currency.code === "INR") {
    return `${currency.symbol}${priceInINR}`;
  }
  const converted = priceInINR * currency.rate;
  // If JPY, keep integer. Else 2 decimal places
  if (currency.code === "JPY") {
    return `${currency.symbol}${Math.ceil(converted)}`;
  }
  return `${currency.symbol}${converted.toFixed(2)}`;
}

export function getPriceInSelectedCurrency(priceInINR: number, currency: CurrencyInfo): number {
  if (currency.code === "INR") return priceInINR;
  const converted = priceInINR * currency.rate;
  if (currency.code === "JPY") return Math.ceil(converted);
  return Number(converted.toFixed(2));
}
