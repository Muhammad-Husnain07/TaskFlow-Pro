import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-slate-300" />
      ) : (
        <Sun className="w-5 h-5 text-gray-600 dark:text-slate-300" />
      )}
    </button>
  );
};

export default ThemeToggle;