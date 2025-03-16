import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names.
 * - `clsx` handles conditional class merging.
 * - `twMerge` intelligently merges Tailwind classes, preventing conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a duration (in milliseconds) into a "MM:SS" string.
 * - Converts total duration into minutes and seconds.
 * - Ensures two-digit formatting using `padStart(2, "0")`.
 *
 * @param duration - The duration in milliseconds.
 * @returns A formatted string in "MM:SS" format.
 */
export const formatDuration = (duration: number) => {
  const seconds = Math.floor((duration % 60000) / 1000); // Extracts seconds
  const minutes = Math.floor(duration / 60000); // Extracts minutes
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`; // Ensures proper formatting
};

/**
 * Converts a snake_case string into a human-readable title.
 * - Replaces underscores with spaces.
 * - Capitalizes the first letter of each word.
 *
 * @param str - The snake_case string.
 * @returns A formatted title string.
 */
export const snakeCaseToTitle = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};
