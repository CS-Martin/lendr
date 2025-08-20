import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString?: Date | string) => {
  if (!dateString) return 'Unknown';

  try {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  } catch {
    return 'Invalid date';
  }
};

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export const truncateText = (text: string, startLength = 6, endLength = 4) => {
  if (!text) return '';
  if (text.length <= startLength + endLength) return text;
  return `${text.slice(0, startLength)}...${text.slice(-endLength)}`;
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function formatDuration(hours: number) {
  const days = Math.floor(hours / 24);
  const hrs = hours % 24;

  if (days > 0 && hrs > 0) {
    return `${days} day${days > 1 ? "s" : ""} ${hrs} hr${hrs > 1 ? "s" : ""}`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  } else {
    return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  }
}