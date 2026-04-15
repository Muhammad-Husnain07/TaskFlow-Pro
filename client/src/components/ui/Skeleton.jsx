const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    image: 'h-40 w-full rounded-lg',
    button: 'h-10 w-24 rounded-lg',
    card: 'h-48 w-full rounded-xl',
    input: 'h-10 w-full rounded-lg',
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
  <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
    <Skeleton variant="text" className="w-1/3 mb-2" />
    <Skeleton variant="title" />
    <SkeletonText lines={2} className="mt-2" />
  </div>
);

export const ProjectListSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton variant="avatar" className="w-10 h-10" />
          <Skeleton variant="title" className="w-1/2" />
        </div>
        <SkeletonText lines={2} />
        <div className="flex items-center gap-2 mt-3">
          <Skeleton variant="text" className="w-16" />
          <Skeleton variant="text" className="w-16" />
        </div>
      </div>
    ))}
  </div>
);

export const TaskBoardSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto">
    {['To Do', 'In Progress', 'In Review', 'Done'].map((col, i) => (
      <div key={col} className="w-72 flex-shrink-0">
        <div className="flex items-center justify-between px-2 py-3">
          <Skeleton variant="text" className="w-20" />
          <Skeleton variant="text" className="w-8" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
              <Skeleton variant="text" className="w-3/4 mb-2" />
              <Skeleton variant="text" className="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const NotificationSkeleton = ({ count = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-start gap-3 p-3">
        <Skeleton variant="avatar" className="w-8 h-8" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-3/4 mb-1" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;