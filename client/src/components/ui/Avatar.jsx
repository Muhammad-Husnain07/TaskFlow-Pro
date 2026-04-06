const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = alt ? alt.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return src ? (
    <img
      src={src}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 ${className}`}
    />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-primary-500 flex items-center justify-center text-white font-medium ring-2 ring-white dark:ring-gray-800 ${className}`}>
      {initials}
    </div>
  );
};

export const AvatarGroup = ({ children, max = 4, size = 'md' }) => {
  const childArray = Array.isArray(children) ? children : [children];
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className="flex -space-x-3">
      {visibleAvatars.map((child, index) => (
        <div key={index} className="relative">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className={`relative flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium ring-2 ring-white dark:ring-gray-800 ${
          size === 'sm' ? 'w-8 h-8 text-xs' :
          size === 'lg' ? 'w-12 h-12 text-base' :
          'w-10 h-10 text-sm'
        }`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;