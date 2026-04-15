import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useProjects, useMyTasks } from '../../hooks/useProjects';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Badge, Avatar, AvatarGroup, Skeleton, EmptyState } from '../../components/ui';
import { FolderKanban, CheckSquare, Clock, Users, Plus, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import { TASK_STATUS_LABELS, STATUS_COLORS, TASK_STATUS } from '../../constants';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
  >
    <div
      className="w-10 h-10 rounded-lg flex-shrink-0"
      style={{ backgroundColor: project.color || '#7c6af7' }}
    />
    <div className="flex-1 min-w-0">
      <h4 className="font-medium truncate">{project.name}</h4>
      <p className="text-sm text-gray-500 truncate">
        {project.description || 'No description'}
      </p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      {project.members?.length > 0 && (
        <AvatarGroup max={3}>
          {project.members.slice(0, 3).map((member, i) => (
            <Avatar key={i} alt={member.user?.name} size="xs" />
          ))}
        </AvatarGroup>
      )}
    </div>
  </div>
);

const TaskItem = ({ task, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TASK_STATUS.DONE;
  
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        task.status === TASK_STATUS.DONE ? 'bg-green-500' :
        task.status === TASK_STATUS.IN_PROGRESS ? 'bg-blue-500' :
        isOverdue ? 'bg-danger-500' : 'bg-gray-400'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{task.title}</p>
        <p className="text-sm text-gray-500 truncate">{task.project?.name}</p>
      </div>
      <Badge variant={
        task.status === TASK_STATUS.DONE ? 'success' :
        task.status === TASK_STATUS.IN_PROGRESS ? 'info' :
        isOverdue ? 'danger' : 'default'
      } size="sm">
        {TASK_STATUS_LABELS[task.status]}
      </Badge>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ limit: 5 });
  const { data: tasksData, isLoading: tasksLoading } = useMyTasks();

  const projects = Array.isArray(projectsData?.data) ? projectsData.data : [];
  const myTasks = Array.isArray(tasksData?.data) ? tasksData.data : [];

  const totalProjects = projectsData?.pagination?.total || 0;
  const completedTasks = Array.isArray(myTasks) ? myTasks.filter(t => t.status === TASK_STATUS.DONE).length : 0;
  const openTasks = Array.isArray(myTasks) ? myTasks.filter(t => t.status !== TASK_STATUS.DONE).length : 0;

  const thisWeekDue = Array.isArray(myTasks) ? myTasks.filter(t => {
    if (!t.dueDate || t.status === TASK_STATUS.DONE) return false;
    const dueDate = new Date(t.dueDate);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return dueDate <= weekFromNow;
  }).length : 0;

  const stats = [
    { label: 'Total Projects', value: totalProjects, icon: FolderKanban, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' },
    { label: 'Open Tasks', value: openTasks, icon: CheckSquare, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'Due This Week', value: thisWeekDue, icon: Clock, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: 'Completed', value: completedTasks, icon: Users, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  ];

  return (
    <AppLayout title="Dashboard" breadcrumbs={['Dashboard']}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <StatCard key={label} label={label} value={value} icon={Icon} color={color} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Projects</h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {projectsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onClick={() => navigate(`/projects/${project._id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FolderKanban className="w-8 h-8" />}
                title="No projects yet"
                description="Create your first project to get started"
                action={
                  <Button size="sm" onClick={() => navigate('/projects')}>
                    <Plus className="w-4 h-4 mr-1" /> New Project
                  </Button>
                }
              />
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Tasks</h3>
              <Badge variant="primary">{myTasks.length} tasks</Badge>
            </div>

            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : myTasks.length > 0 ? (
              <div className="space-y-2">
                {myTasks.slice(0, 5).map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onClick={() => navigate(`/projects/${task.project?._id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CheckSquare className="w-8 h-8" />}
                title="No tasks assigned"
                description="You don't have any tasks yet"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-4">
          <Button onClick={() => navigate('/projects')}>
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            Create Task
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;