import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { projectsAPI } from '../../api';
import AppLayout from '../../components/layout/AppLayout';
import { FolderKanban, CheckSquare, Clock, Users } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll({ limit: 5 });
      setProjects(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'bg-primary-100 text-primary-600' },
    { label: 'Tasks Done', value: 12, icon: CheckSquare, color: 'bg-green-100 text-green-600' },
    { label: 'In Progress', value: 5, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Team Members', value: 8, icon: Users, color: 'bg-blue-100 text-blue-600' },
  ];

  return (
    <AppLayout title="Dashboard" breadcrumbs={['Dashboard']}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
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
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: project.color || '#7c6af7' }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-gray-500">
                      {project.members?.length || 0} members
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'active' ? 'bg-green-100 text-green-600' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No projects yet. Create your first project!</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;