const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  compact = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-12'} ${className}`}>
      {icon && (
        <div className={`bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400 ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
          {icon}
        </div>
      )}
      {title && (
        <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-base mb-1' : 'text-lg mb-2'}`}>
          {title}
        </h3>
      )}
      {description && (
        <p className={`text-gray-500 dark:text-slate-400 mb-6 max-w-sm ${compact ? 'text-sm' : ''}`}>
          {description}
        </p>
      )}
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;