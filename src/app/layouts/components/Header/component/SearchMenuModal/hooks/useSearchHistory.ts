import { useState } from 'react';
import type { SearchHistoryItem } from '../types';

const STORAGE_KEY = 'searchMenuHistory:v1';
const LEGACY_STORAGE_KEY = 'searchMenuHistory';
const MAX_ITEMS = 10;

function readHistoryFromStorage(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SearchHistoryItem[];
    if (localStorage.getItem(STORAGE_KEY) === null && localStorage.getItem(LEGACY_STORAGE_KEY) !== null) {
      localStorage.setItem(STORAGE_KEY, raw);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    return parsed;
  } catch {
    return [];
  }
}

function writeHistoryToStorage(items: SearchHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota / private-mode failures
  }
}

function formatTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (minutes < 1) {
    return '刚刚';
  }
  if (minutes < 60) {
    return `${minutes}分钟前`;
  }
  if (hours < 24) {
    return `${hours}小时前`;
  }
  if (days < 7) {
    return `${days}天前`;
  }
  return new Date(timestamp).toLocaleDateString();
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>(readHistoryFromStorage);

  const add = (item: SearchHistoryItem) => {
    const next = [item, ...history.filter((h) => h.id !== item.id)].slice(0, MAX_ITEMS);
    setHistory(next);
    writeHistoryToStorage(next);
  };

  const remove = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    writeHistoryToStorage(next);
  };

  const clear = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  };

  return { history, add, remove, clear, formatTime };
}
