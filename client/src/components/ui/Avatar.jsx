const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const initials = alt ? alt.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return src ? (
    <img
      src={src}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover ${className}`}
    />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-primary-500 flex items-center justify-center text-white font-medium ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;