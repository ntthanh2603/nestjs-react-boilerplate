import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts initials from a full name, optimized for Vietnamese names
 * For 3+ words, takes the first letter of the last two words
 * @param name The full name to extract initials from
 * @returns The initials in uppercase
 * @example
 * getInitials("Nguyễn Mạnh Thành") // "MT"
 * getInitials("Trần Văn A") // "VA"
 * getInitials("Nguyễn Thị") // "NT"
 * getInitials("Minh") // "MI"
 * getInitials("") // ""
 */
export function getInitials(name?: string | null): string {
  if (!name?.trim()) return "";

  const words = name.trim().split(/\s+/);
  const wordCount = words.length;

  if (wordCount === 0) return "";
  if (wordCount === 1) {
    // Return first 2 characters if only one word
    return words[0].slice(0, 2).toUpperCase();
  }

  if (wordCount === 2) {
    // Return first letter of each word if two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // For 3+ words, take first letter of last two words
  return (words[wordCount - 2][0] + words[wordCount - 1][0]).toUpperCase();
}
