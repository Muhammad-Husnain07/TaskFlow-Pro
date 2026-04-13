import { useEffect } from 'react';
import { useSearch, useRecentSearches } from '../hooks/useSearch';
import { Search as SearchIcon, Folder, CheckSquare, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Spinner, EmptyState } from '../ui';
import { TASK_STATUS_LABELS } from '../constants';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  
  const { data, isLoading } = useSearch(query, { type, limit: 20, enabled: query.length > 1 });

  const handleFilterChange = (newType) => {
    setSearchParams({ q: query, type: newType });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Results</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {query ? `Showing results for "${query}"` : 'Enter a search term above'}
        </p>
      </div>

      {query && (
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'all' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('project')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'project' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => handleFilterChange('task')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'task' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Tasks
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : query.length < 2 ? (
        <EmptyState
          icon={<SearchIcon className="w-12 h-12" />}
          title="Enter a search term"
          description="Type at least 2 characters to search"
        />
      ) : (
        <div className="space-y-8">
          {(type === 'all' || type === 'project') && data?.projects?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projects ({data.projects.length})</h2>
              <div className="grid gap-3">
                {data.projects.map((project) => (
                  <a
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
                      <Folder className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{project.memberCount} members</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(type === 'all' || type === 'task') && data?.tasks?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks ({data.tasks.length})</h2>
              <div className="grid gap-3">
                {data.tasks.map((task) => (
                  <a
                    key={task._id}
                    href={`/projects/${task.projectId}/tasks/${task._id}`}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <CheckSquare className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{task.projectName}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(!data?.projects?.length && !data?.tasks?.length) && query.length >= 2 && (
            <EmptyState
              icon={<SearchIcon className="w-12 h-12" />}
              title="No results found"
              description="Try different keywords or filters"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;