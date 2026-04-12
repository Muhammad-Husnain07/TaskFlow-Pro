import { create } from 'zustand';
import { getSocket } from '../socket/socket';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  
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
    if (!socket) return;
    
    socket.on('notification:new', (notification) => {
      get().addNotification(notification);
    });
  },
  
  removeSocketListeners: () => {
    const socket = getSocket();
    if (socket) {
      socket.off('notification:new');
    }
  }
}));