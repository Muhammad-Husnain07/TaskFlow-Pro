import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import AppLayout from '../../components/layout/AppLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const Settings = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <AppLayout title="Settings" breadcrumbs={['Settings']}>
      <div className="max-w-2xl space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <Avatar src={formData.avatar} alt={formData.name} size="xl" />
            <Button variant="secondary" size="sm">Change Avatar</Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled
            />
            <Button type="submit" isLoading={loading}>Save Changes</Button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form className="space-y-4">
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm Password" type="password" />
            <Button>Update Password</Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;