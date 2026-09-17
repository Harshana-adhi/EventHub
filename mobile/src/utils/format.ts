export function formatPrice(amount: number): string {
  return `LKR ${amount.toLocaleString()}`;
}

export function normalizeCategory(category: string): string {
  const trimmed = category.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
