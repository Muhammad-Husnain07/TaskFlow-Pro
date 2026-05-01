import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject, useArchiveProject, useAddProjectMember, useRemoveProjectMember, useTasks } from '../../hooks/useProjects';
import { useAuthStore } from '../../store/authStore';
import { useRecentProjectsStore } from '../../store/recentProjectsStore';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Badge, Avatar, AvatarGroup, Input, Modal, Skeleton, EmptyState } from '../../components/ui';
import { Toaster, toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
  Settings, Users, Layout, List, Info, Plus, Mail, Trash2,
  Shield, ChevronDown, Calendar, ArrowLeft, MoreHorizontal, Archive
} from 'lucide-react';
import { MEMBER_ROLES } from '../../constants';
import TaskBoard from './TaskBoard';
import TaskDetailModal from '../tasks/TaskDetailModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'board', label: 'Board', icon: Layout },
  { id: 'list', label: 'List', icon: List },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const MemberCard = ({ member, currentUserRole, onRoleChange, onRemove }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = member.role === MEMBER_ROLES.OWNER;
  const canChangeRole = currentUserRole === MEMBER_ROLES.OWNER && !isOwner;
  const canRemove = currentUserRole === MEMBER_ROLES.OWNER && !isOwner;

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Avatar alt={member.user?.name} src={member.user?.avatar} size="md" />
        <div>
          <p className="font-medium">{member.user?.name}</p>
          <p className="text-sm text-gray-500">{member.user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={
          member.role === MEMBER_ROLES.OWNER ? 'primary' :
          member.role === MEMBER_ROLES.ADMIN ? 'warning' : 'default'
        }>
          {member.role}
        </Badge>
        {canChangeRole && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-32">
                {Object.values(MEMBER_ROLES).filter(r => r !== MEMBER_ROLES.OWNER).map(role => (
                  <button
                    key={role}
                    onClick={() => { onRoleChange(member.user._id, role); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Make {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {canRemove && (
          <button
            onClick={() => onRemove(member.user._id)}
            className="p-2 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const InviteMemberForm = ({ projectId, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(MEMBER_ROLES.MEMBER);
  const [loading, setLoading] = useState(false);
  const addMember = useAddProjectMember();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      await addMember.mutateAsync({ projectId, data: { email, role } });
      toast.success('Member added successfully!');
      setEmail('');
      setRole(MEMBER_ROLES.MEMBER);
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        placeholder="Enter email to invite"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
      >
        <option value={MEMBER_ROLES.MEMBER}>Member</option>
        <option value={MEMBER_ROLES.ADMIN}>Admin</option>
      </select>
      <Button type="submit" isLoading={loading}>
        <Plus className="w-4 h-4 mr-1" /> Invite
      </Button>
    </form>
  );
};

const OverviewTab = ({ project, tasks }) => {
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;
  const overdueTasks = tasks?.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < new Date();
  }).length || 0;

  const stats = [
    { label: 'Total Tasks', value: totalTasks },
    { label: 'Completed', value: completedTasks },
    { label: 'In Progress', value: inProgressTasks },
    { label: 'Overdue', value: overdueTasks, color: 'text-danger-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {project.description && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-3">Description</h3>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{project.description}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold mb-3">Team Members</h3>
        <AvatarGroup max={10}>
          {project.members?.map((member, i) => (
            <Avatar key={i} alt={member.user?.name} src={member.user?.avatar} />
          ))}
        </AvatarGroup>
      </div>
    </div>
  );
};

const MembersTab = ({ project, currentUserRole }) => {
  const updateRole = useAddProjectMember();
  const removeMember = useRemoveProjectMember();

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateRole.mutateAsync({ 
        projectId: project._id, 
        data: { email: 'temp@temp.com', role: newRole } 
      });
      toast.success('Role updated');
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMember.mutateAsync({ projectId: project._id, userId });
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {currentUserRole === MEMBER_ROLES.OWNER && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className="font-medium mb-3">Invite New Member</h3>
          <InviteMemberForm projectId={project._id} />
        </div>
      )}

      <div className="space-y-3">
        {project.members?.map((member, i) => (
          <MemberCard
            key={i}
            member={member}
            currentUserRole={currentUserRole}
            onRoleChange={handleRoleChange}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

const SettingsTab = ({ project, onUpdate, onDelete, onArchive, navigate }) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    color: project.color,
    status: project.status,
    dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const updateProject = useUpdateProject();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProject.mutateAsync({ id: project._id, data: formData });
      toast.success('Project updated!');
      onUpdate?.();
    } catch (err) {
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(project.status === 'archived' ? 'Unarchive this project?' : 'Archive this project?')) return;
    setArchiving(true);
    try {
      await onArchive.mutateAsync(project._id);
      toast.success(project.status === 'archived' ? 'Project unarchived!' : 'Project archived!');
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive project');
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete.mutateAsync(project._id);
      toast.success('Project deleted!');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const colors = ['#7c6af7', '#f76c6c', '#5ee7bf', '#ff9f43', '#54a0ff', '#a55eea', '#00d2d3', '#ff6b6b'];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="font-semibold">Project Details</h3>
        
        <Input
          label="Project Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
          <div className="flex gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-lg ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <Button onClick={handleSave} isLoading={saving}>Save Changes</Button>
      </div>

      <div className="bg-danger-50 dark:bg-danger-900/20 rounded-xl p-6 border border-danger-200 dark:border-danger-800">
        <h3 className="font-semibold text-danger-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          These actions are irreversible. Please be careful.
        </p>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={handleArchive}
            isLoading={archiving}
            disabled={archiving || deleting}
          >
            <Archive className="w-4 h-4 mr-1" />
            {project.status === 'archived' ? 'Unarchive Project' : 'Archive Project'}
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            isLoading={deleting}
            disabled={archiving || deleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Project
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useProject(id);
  const { data: tasksData } = useTasks(id);
  const deleteProject = useDeleteProject();
  const archiveProject = useArchiveProject();

  const [activeTab, setActiveTab] = useState('overview');
  const [tabFocusIndex, setTabFocusIndex] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);

  const project = data;
  const tasks = Array.isArray(tasksData?.data) ? tasksData.data : [];
  const { addRecent } = useRecentProjectsStore();

  useEffect(() => {
    if (project) {
      addRecent({ id: project._id, name: project.name, color: project.color });
    }
  }, [project?._id]);

  useEffect(() => {
    const passedTask = location.state?.selectedTask;
    if (passedTask) {
      setSelectedTask(passedTask);
      setActiveTab('board');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.selectedTask]);

  const currentUserMember = project?.members?.find(m => m.user?._id === user?.id || m.user === user?.id);
  const currentUserRole = currentUserMember?.role;

  const handleKeyDown = (e) => {
    if (document.activeElement?.closest('[data-tab-container]')) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const newIndex = e.key === 'ArrowRight' 
          ? (tabFocusIndex + 1) % TABS.length 
          : (tabFocusIndex - 1 + TABS.length) % TABS.length;
        setTabFocusIndex(newIndex);
        setActiveTab(TABS[newIndex].id);
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading..." breadcrumbs={['Projects', 'Loading']}>
        <Skeleton className="h-96" />
      </AppLayout>
    );
  }

  if (!project && !isLoading) {
    return (
      <AppLayout title="Not Found" breadcrumbs={['Projects', 'Not Found']}>
        <EmptyState
          title="Project not found"
          description="This project doesn't exist or you don't have access"
          action={<Button onClick={() => navigate('/projects')}>Back to Projects</Button>}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title={project.name} 
      breadcrumbs={['Projects', project.name]}
      rightContent={
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: project.color }}
          />
          <Badge variant={project.status === 'active' ? 'success' : 'default'}>
            {project.status}
          </Badge>
        </div>
      }
    >
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>

        <div 
          data-tab-container
          className="flex border-b border-gray-200 dark:border-gray-700 -mx-6 px-6"
          onKeyDown={handleKeyDown}
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              ref={i === tabFocusIndex ? (el) => el?.focus() : null}
              onClick={() => { setActiveTab(tab.id); setTabFocusIndex(i); }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab project={project} tasks={tasks} />}
        {activeTab === 'board' && <TaskBoard projectId={id} onTaskClick={setSelectedTask} />}
        {activeTab === 'list' && <div className="text-center py-12 text-gray-500">List view coming soon</div>}
        {activeTab === 'members' && <MembersTab project={project} currentUserRole={currentUserRole} />}
        {activeTab === 'settings' && (
          <SettingsTab 
            project={project} 
            onUpdate={refetch} 
            onDelete={deleteProject}
            onArchive={archiveProject}
            navigate={navigate}
          />
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={id}
        />
      )}
    </AppLayout>
  );
};

export default ProjectDetail;