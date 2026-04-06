const Badge = ({ children, variant = 'default', size = 'md', showDot = false, className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-danger-500',
    info: 'bg-blue-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {showDot && (
        <span className={`${dotSizes[size]} rounded-full ${dotColors[variant]} mr-1.5`} />
      )}
      {children}
    </span>
  );
};

export default Badge;