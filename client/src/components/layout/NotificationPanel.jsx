import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { useNotificationStore } from '../store/notificationStore';
import { Avatar, Spinner, EmptyState } from '../ui';
import { 
  Bell, 
  CheckCircle, 
  MessageSquare, 
  UserPlus, 
  Clock,
  AlertCircle,
  ArrowRight,
  Check
} from 'lucide-react';

const NOTIFICATION_ICONS = {
  task_assigned: <CheckCircle className="w-4 h-4 text-blue-500" />,
  comment_added: <MessageSquare className="w-4 h-4 text-green-500" />,
  member_invited: <UserPlus className="w-4 h-4 text-purple-500" />,
  task_due: <Clock className="w-4 h-4 text-orange-500" />,
  task_status_changed: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  project_update: <Bell className="w-4 h-4 text-gray-500" />,
  mention: <MessageSquare className="w-4 h-4 text-indigo-500" />
};

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notifications, setNotifications, markAsRead, markAllAsRead, setUnreadCount } = useNotificationStore();
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationApi.getAll({ page, limit: 20 }),
    select: (res) => res.data?.data,
  });

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setNotifications(data);
      } else {
        setNotifications((prev) => [...prev, ...data]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    notificationApi.getCount().then((res) => {
      setUnreadCount(res.data?.data?.count || 0);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && data?.length >= 20) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, data]);

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      markAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    onClose();
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button
          onClick={handleMarkAllRead}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center p-8">
            <Spinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => (
              <button
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left transition-colors ${
                  !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                }`}
              >
                {notification.sender?.avatar ? (
                  <Avatar user={notification.sender} size="sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    {NOTIFICATION_ICONS[notification.type] || <Bell className="w-4 h-4" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </button>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="p-2 text-center">
          {isLoading && <Spinner size="sm" />}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;