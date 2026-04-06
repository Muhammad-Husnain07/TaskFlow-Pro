const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    image: 'h-40 w-full rounded-lg',
    button: 'h-10 w-24 rounded-lg',
    card: 'h-48 w-full rounded-xl',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variants[variant]} ${className}`}
    />
  );
};

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} variant="text" className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl ${className}`}>
    <Skeleton variant="image" className="mb-4" />
    <Skeleton variant="title" />
    <SkeletonText lines={2} className="mt-2" />
  </div>
);

export default Skeleton;