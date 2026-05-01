import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import AppLayout from '../../components/layout/AppLayout';
import { Input, Button, Avatar, Modal, Spinner } from '../../components/ui';
import api from '../../api/axios';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Trash2, 
  Upload, 
  Camera,
  Check,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const ACCENT_COLORS = [
  { name: 'Purple', value: '#7c6af7' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
];

const ProfileTab = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/auth/profile', data),
    onSuccess: (res) => {
      onUpdate(res.data?.data);
    },
  });
  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: (res) => {
      setFormData(prev => ({ ...prev, avatar: res.data?.data?.avatar }));
      onUpdate(res.data?.data);
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      const fd = new FormData();
      fd.append('avatar', file);
      uploadMutation.mutate(fd);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({ name: formData.name, bio: formData.bio });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar 
              src={avatarPreview || formData.avatar} 
              alt={formData.name} 
              size="xl" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
            <p className="text-sm text-gray-500">Click the camera icon to upload</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Tell us about yourself..."
            />
          </div>
          <Button
            onClick={handleSave}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const AccountTab = ({ user }) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const updatePasswordMutation = useMutation({
    mutationFn: (data) => api.put('/auth/password', data),
    onSuccess: () => {
      setPasswords({ current: '', new: '', confirm: '' });
    },
  });

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            error={passwords.confirm && passwords.new !== passwords.confirm ? 'Passwords do not match' : undefined}
          />
          <Button
            onClick={handlePasswordChange}
            isLoading={updatePasswordMutation.isPending}
            disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm}
          >
            Update Password
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-red-200 dark:border-red-900/30">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button 
          variant="danger" 
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </Button>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <p className="text-sm text-gray-500">
            Type <strong>{user?.email}</strong> to confirm
          </p>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type your email to confirm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              disabled={deleteConfirm !== user?.email}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const NotificationsTab = () => {
  const [preferences, setPreferences] = useState({
    email: {
      taskAssigned: true,
      commentAdded: true,
      taskDue: true,
    },
    inApp: {
      taskAssigned: true,
      commentAdded: true,
      taskDue: true,
      memberInvited: true,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/auth/notification-preferences', data),
  });

  const handleToggle = (category, key) => {
    const updated = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: !preferences[category][key],
      },
    };
    setPreferences(updated);
    updateMutation.mutate(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'taskAssigned', label: 'Task assigned to me' },
            { key: 'commentAdded', label: 'Comments on my tasks' },
            { key: 'taskDue', label: 'Task due date reminders' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <button
                onClick={() => handleToggle('email', item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preferences.email[item.key] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.email[item.key] ? 'left-6' : 'left-1'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">In-App Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'taskAssigned', label: 'Task assigned to me' },
            { key: 'commentAdded', label: 'Comments on my tasks' },
            { key: 'taskDue', label: 'Task due date reminders' },
            { key: 'memberInvited', label: 'Project invitations' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <button
                onClick={() => handleToggle('inApp', item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preferences.inApp[item.key] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.inApp[item.key] ? 'left-6' : 'left-1'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const AppearanceTab = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useThemeStore();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 124, g: 106, b: 247 };
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const adjustBrightness = (hex, percent) => {
    const rgb = hexToRgb(hex);
    const adjust = (val) => Math.min(255, Math.max(0, Math.round(val + (255 - val) * percent / 100)));
    return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
  };

  useEffect(() => {
    const lighterColor = adjustBrightness(accentColor, 85);
    const darkerColor = adjustBrightness(accentColor, -25);
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--color-accent-50', lighterColor);
    document.documentElement.style.setProperty('--color-accent-dark', darkerColor);
  }, [accentColor]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                theme === t.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <t.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
        <div className="grid grid-cols-6 gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                accentColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <AppLayout title="Settings" breadcrumbs={['Settings']}>
      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && <ProfileTab user={user} onUpdate={setUser} />}
          {activeTab === 'account' && <AccountTab user={user} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;