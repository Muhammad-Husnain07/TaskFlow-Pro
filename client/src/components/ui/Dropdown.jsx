import { useState, useRef, useEffect } from 'react';

const Dropdown = ({ trigger, children, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={`absolute z-50 mt-2 min-w-48 bg-white dark:bg-gray-800 rounded-xl shadow-large border border-gray-100 dark:border-gray-700 py-1 ${alignClasses[align]} transform transition-all duration-200 origin-top-${align}`}>
          {Array.isArray(children) ? (
            children.map((child, index) => (
              <div key={index}>{child}</div>
            ))
          ) : children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = '', danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
      danger
        ? 'text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    } ${className}`}
  >
    {children}
  </button>
);

export const DropdownDivider = () => (
  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
);

export default Dropdown;