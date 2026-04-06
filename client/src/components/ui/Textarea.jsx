import { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none ${
          error
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200'
            : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
        } dark:bg-gray-800 dark:text-white ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;