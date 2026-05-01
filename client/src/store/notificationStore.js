import { create } from 'zustand';
import { getSocket } from '../socket/socket';
import { toast } from 'react-hot-toast';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'task_assigned': return '📋';
    case 'comment_added': return '💬';
    case 'member_invited': return '👋';
    case 'task_status_changed': return '🔄';
    case 'task_due': return '⏰';
    case 'mention': return '@';
    default: return '🔔';
  }
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => {
    console.log('[TOAST] Showing notification:', notification.message, 'type:', notification.type);
    const icon = getNotificationIcon(notification.type);
    toast.success(notification.message, {
      icon,
      duration: 5000,
    });
    console.log('[TOAST] Toast called');
    
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
  
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  
  decrementUnread: () => set((state) => ({ 
    unreadCount: Math.max(0, state.unreadCount - 1) 
  })),
  
  markAsRead: (notificationId) => set((state) => {
    const notification = state.notifications.find(n => n._id === notificationId);
    return {
      notifications: state.notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: notification && !notification.read 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount
    };
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  removeNotification: (notificationId) => set((state) => {
    const notification = state.notifications.find(n => n._id === notificationId);
    return {
      notifications: state.notifications.filter(n => n._id !== notificationId),
      unreadCount: notification && !notification.read 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount
    };
  }),
  
  initSocketListeners: () => {
    const socket = getSocket();
    if (!socket) {
      console.log('[CLIENT] initSocketListeners: socket not found');
      return;
    }
    
    console.log('[CLIENT] Socket found, adding notification listener');
    
    socket.on('notification:new', (notification) => {
      console.log('[CLIENT] Received real-time notification:', notification);
      toast.success(notification.message, {
        duration: 4000,
      });
      
      get().addNotification(notification);
    });
    
    socket.on('connect', () => {
      console.log('[CLIENT] Socket connected');
    });
  },
  
  removeSocketListeners: () => {
    const socket = getSocket();
    if (socket) {
      socket.off('notification:new');
    }
  }
}));