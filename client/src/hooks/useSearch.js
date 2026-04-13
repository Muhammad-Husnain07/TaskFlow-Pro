import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useSearch = (query, options = {}) => {
  const { type = 'all', limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: ['search', query, type, limit],
    queryFn: () => api.get('/search', { params: { q: query, type, limit } }),
    select: (res) => res.data?.data,
    enabled: enabled && query.length > 1,
  });
};

export const useDebouncedSearch = (delay = 200) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debounce = useCallback((value) => {
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleChange = (value) => {
    setQuery(value);
    return debounce(value);
  };

  return { query, debouncedQuery, handleChange, setDebouncedQuery };
};

export const useRecentSearches = () => {
  const STORAGE_KEY = 'recentSearches';
  const MAX_RECENT = 5;

  const getRecent = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const addRecent = useCallback((search) => {
    try {
      const recent = getRecent();
      const filtered = recent.filter(r => r.query !== search.query);
      const updated = [search, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, [getRecent]);

  const removeRecent = useCallback((query) => {
    try {
      const recent = getRecent().filter(r => r.query !== query);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {}
  }, [getRecent]);

  const clearRecent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { getRecent, addRecent, removeRecent, clearRecent };
};