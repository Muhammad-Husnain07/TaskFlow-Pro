import { Search, Command } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from './NotificationBell';

const Navbar = ({ title, breadcrumbs }) => {
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div>
        {breadcrumbs && (
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-white' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h2 className="text-xl font-heading font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-12 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        <ThemeToggle />

        <NotificationBell />
      </div>
    </header>
  );
};

export default Navbar;