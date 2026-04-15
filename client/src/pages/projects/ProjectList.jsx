import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject } from '../../hooks/useProjects';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Badge, Avatar, AvatarGroup, Skeleton, EmptyState, Input, Modal, ProjectListSkeleton } from '../../components/ui';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Search, FolderKanban, Grid, List, SlidersHorizontal, Calendar, X } from 'lucide-react';
import { PROJECT_STATUS } from '../../constants';

const COLORS = ['#7c6af7', '#f76c6c', '#5ee7bf', '#ff9f43', '#54a0ff', '#a55eea', '#00d2d3', '#ff6b6b'];
const STATUS_OPTIONS = ['', 'active', 'archived', 'completed'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'dueDate', label: 'Due Date' },
];

const ProjectCard = ({ project, onClick }) => {
  const projectDueDate = project.dueDate ? new Date(project.dueDate) : null;
  const isOverdue = projectDueDate && projectDueDate < new Date() && project.status !== 'completed';

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-soft hover:shadow-medium cursor-pointer transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: project.color || '#7c6af7' }}
        >
          <FolderKanban className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {project.description || 'No description'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {project.members?.length > 0 && (
            <AvatarGroup max={3}>
              {project.members.slice(0, 5).map((member, i) => (
                <Avatar key={i} alt={member.user?.name} size="xs" />
              ))}
            </AvatarGroup>
          )}
          <span className="text-sm text-gray-500">
            {project.members?.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {projectDueDate && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-danger-500' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              {projectDueDate.toLocaleDateString()}
            </span>
          )}
          <Badge variant={
            project.status === 'active' ? 'success' :
            project.status === 'completed' ? 'info' :
            'default'
          } size="sm">
            {project.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const ProjectList = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useProjects();
  const createProject = useCreateProject();
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('projectViewMode') || 'grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#7c6af7',
    tags: [],
    dueDate: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    localStorage.setItem('projectViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    try {
      await createProject.mutateAsync(newProject);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', color: '#7c6af7', tags: [], dueDate: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!newProject.tags.includes(tagInput.trim())) {
        setNewProject({ ...newProject, tags: [...newProject.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setNewProject({ ...newProject, tags: newProject.tags.filter(t => t !== tag) });
  };

  const projects = data?.data || [];
  const pagination = data?.pagination || {};

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      result = result.filter(p => p.status === status);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, search, status, sortBy]);

  return (
    <AppLayout title="Projects" breadcrumbs={['Projects']}>
      <Toaster position="top-right" />
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.slice(1).map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {isLoading ? (
          <ProjectListSkeleton count={6} />
        ) : filteredProjects.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onClick={() => navigate(`/projects/${project._id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderKanban className="w-12 h-12" />}
            title="No projects found"
            description={search || status ? 'Try adjusting your filters' : 'Create your first project to get started'}
            action={
              !search && !status ? (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Project
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} isLoading={createProject.isPending}>Create Project</Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label="Project Name"
            placeholder="Enter project name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            required
          />

          <Input
            label="Description"
            placeholder="Enter project description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewProject({ ...newProject, color })}
                  className={`w-8 h-8 rounded-lg transition-transform ${newProject.color === color ? 'scale-110 ring-2 ring-offset-2 ring-primary-500' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Input
            label="Due Date"
            type="date"
            value={newProject.dueDate}
            onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
          />

          <div>
            <Input
              label="Tags"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {newProject.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newProject.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default ProjectList;