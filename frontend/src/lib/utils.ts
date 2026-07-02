import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("vi-VN") + "đ";
}

export function formatCompactCurrency(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "tr";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}
