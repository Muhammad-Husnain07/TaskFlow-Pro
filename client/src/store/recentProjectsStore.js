import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRecentProjectsStore = create(
  persist(
    (set, get) => ({
      recentProjects: [],
      
      addRecent: (project) => {
        const current = get().recentProjects;
        const filtered = current.filter(p => p.id !== project.id);
        const updated = [{ id: project.id, name: project.name, color: project.color }, ...filtered].slice(0, 5);
        set({ recentProjects: updated });
      },
      
      removeRecent: (projectId) => {
        set({ recentProjects: get().recentProjects.filter(p => p.id !== projectId) });
      },
      
      clearRecent: () => set({ recentProjects: [] }),
    }),
    {
      name: 'recent-projects-storage',
    }
  )
);