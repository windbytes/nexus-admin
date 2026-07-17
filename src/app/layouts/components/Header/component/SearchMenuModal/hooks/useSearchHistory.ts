import { useState } from 'react';
import type { SearchHistoryItem } from '../types';

const STORAGE_KEY = 'searchMenuHistory';
const MAX_ITEMS = 10;

function readHistoryFromStorage(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>(readHistoryFromStorage);

  const add = (item: SearchHistoryItem) => {
    setHistory((current) => {
      const items = [item, ...current.filter((h) => h.id !== item.id)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return items;
    });
  };

  const remove = (id: string) => {
    setHistory((current) => {
      const items = current.filter((h) => h.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return items;
    });
  };

  const clear = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString();
  };

  return { history, add, remove, clear, formatTime };
}
