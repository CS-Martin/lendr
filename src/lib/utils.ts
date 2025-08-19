import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString?: Date | string) => {
  if (!dateString) return 'Unknown';

  try {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  } catch {
    return 'Invalid date';
  }
};