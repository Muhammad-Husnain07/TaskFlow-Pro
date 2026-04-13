import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Clock, ArrowRight, Plus, Settings, Layout, Folder, CheckSquare } from 'lucide-react';
import api from '../api/axios';
import { Spinner } from '../ui';
import { useRecentSearches } from '../hooks/useSearch';

const QUICK_ACTIONS = [
  { id: 'create-project', title: 'Create Project', icon: Plus, action: '/projects/new' },
  { id: 'create-task', title: 'Create Task', icon: Plus, action: '/projects' },
  { id: 'settings', title: 'Open Settings', icon: Settings, action: '/settings' },
  { id: 'dashboard', title: 'Go to Dashboard', icon: Layout, action: '/dashboard' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { getRecent, addRecent, removeRecent } = useRecentSearches();

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.get('/search', { params: { q: query, limit: 5 } }),
    select: (res) => res.data?.data,
    enabled: query.length > 1,
  });

  const recentSearches = getRecent();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e) => {
    const items = getDisplayItems();
    const totalItems = items.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [selectedIndex, query, results, recentSearches]);

  const getDisplayItems = () => {
    if (!query) {
      return recentSearches.slice(0, 5).map(r => ({ type: 'recent', ...r }));
    }
    if (query.length < 2) {
      return QUICK_ACTIONS.map(a => ({ type: 'action', ...a }));
    }
    const items = [];
    if (results?.projects?.length) {
      items.push(...results.projects.map(p => ({ type: 'project', ...p })));
    }
    if (results?.tasks?.length) {
      items.push(...results.tasks.map(t => ({ type: 'task', ...t })));
    }
    return items;
  };

  const handleSelect = (item) => {
    if (query.length > 1) {
      addRecent({ query, type: item.type, action: item._id || item.action });
    }

    if (item.type === 'project') {
      navigate(`/projects/${item._id}`);
    } else if (item.type === 'task') {
      navigate(`/projects/${item.projectId}/tasks/${item._id}`);
    } else if (item.type === 'action') {
      navigate(item.action);
    } else if (item.type === 'recent') {
      setQuery(item.query);
    }

    onClose();
  };

  if (!isOpen) return null;

  const items = getDisplayItems();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, tasks..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            <span>ESC</span>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && query.length > 1 ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="md" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No results found</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="py-2">
              {!query && recentSearches.length > 0 && (
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Recent Searches
                  </p>
                </div>
              )}

              {items.map((item, index) => (
                <button
                  key={item._id || item.id || item.query}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    index === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {item.type === 'project' && (
                    <>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '20' }}>
                        <Folder className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.memberCount} members</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>{item.status}</span>
                    </>
                  )}

                  {item.type === 'task' && (
                    <>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <CheckSquare className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.projectName}</p>
                      </div>
                    </>
                  )}

                  {item.type === 'action' && (
                    <>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</span>
                    </>
                  )}

                  {item.type === 'recent' && (
                    <>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{item.query}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300 flex items-center justify-center">↑↓</span>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300 flex items-center justify-center">↵</span>
              Select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;