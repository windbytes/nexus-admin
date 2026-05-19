import { useCallback, useEffect, useState } from 'react';
import type { SearchHistoryItem } from '../types';

const STORAGE_KEY = 'searchMenuHistory';
const MAX_ITEMS = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const persist = useCallback((items: SearchHistoryItem[]) => {
    setHistory(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const add = useCallback(
    (item: SearchHistoryItem) => {
      const items = [item, ...history.filter((h) => h.id !== item.id)].slice(0, MAX_ITEMS);
      persist(items);
    },
    [history, persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(history.filter((h) => h.id !== id));
    },
    [history, persist]
  );

  const clear = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const formatTime = useCallback((timestamp: number) => {
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
  }, []);

  return { history, add, remove, clear, formatTime };
}
