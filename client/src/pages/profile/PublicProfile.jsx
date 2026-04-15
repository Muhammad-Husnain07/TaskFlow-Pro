import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '../../components/layout/AppLayout';
import { Avatar, Spinner, EmptyState } from '../../components/ui';
import { projectApi } from '../../api/projectApi';
import api from '../../api/axios';
import { Calendar, Folder, CheckSquare } from 'lucide-react';
import { TASK_STATUS_LABELS } from '../../constants';

const PublicProfile = () => {
  const { userId } = useParams();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.get(`/users/${userId}`),
    select: (res) => res.data?.data,
    enabled: !!userId,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['user-projects', userId],
    queryFn: () => projectApi.getAll({ member: userId, limit: 10 }),
    select: (res) => res.data?.data,
    enabled: !!userId,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['user-tasks', userId],
    queryFn: () => api.get('/tasks', { params: { assignee: userId, status: 'todo,in_progress,in_review', limit: 10 } }),
    select: (res) => res.data?.data,
    enabled: !!userId,
  });

  if (userLoading) {
    return (
      <AppLayout title="Profile" breadcrumbs={['Profile']}>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const user = userData;
  const projects = projectsData || [];
  const tasks = tasksData || [];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <AppLayout title="Profile" breadcrumbs={['Profile']}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
          <div className="flex items-start gap-6">
            <Avatar src={user?.avatar} alt={user?.name} size="2xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              {user?.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{user.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Projects ({projects.length})
          </h2>
          {projectsLoading ? (
            <Spinner size="md" />
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((project) => (
                <a
                  key={project._id}
                  href={`/projects/${project._id}`}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
                    <Folder className="w-5 h-5" style={{ color: project.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.members?.length || 0} members</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Folder className="w-8 h-8" />}
              title="No projects yet"
              description="This user hasn't joined any projects"
            />
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Open Tasks ({tasks.length})
          </h2>
          {tasksLoading ? (
            <Spinner size="md" />
          ) : tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <a
                  key={task._id}
                  href={`/projects/${task.project?._id}/tasks/${task._id}`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CheckSquare className="w-8 h-8" />}
              title="No open tasks"
              description="This user doesn't have any open tasks"
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PublicProfile;