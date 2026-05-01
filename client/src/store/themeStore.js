import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function generateColorShades(hex, isDark = false) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  if (isDark) {
    return {
      50: `rgba(${r}, ${g}, ${b}, 0.15)`,
      100: `rgba(${r}, ${g}, ${b}, 0.25)`,
      200: `rgba(${r}, ${g}, ${b}, 0.35)`,
      300: `rgba(${r}, ${g}, ${b}, 0.5)`,
      400: `rgba(${r}, ${g}, ${b}, 0.7)`,
      500: hex,
      600: `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`,
      700: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
      800: `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`,
      900: `rgb(${Math.max(0, r - 80)}, ${Math.max(0, g - 80)}, ${Math.max(0, b - 80)})`,
    };
  }
  
  return {
    50: `rgb(${Math.min(255, r + 200)}, ${Math.min(255, g + 200)}, ${Math.min(255, b + 200)})`,
    100: `rgb(${Math.min(255, r + 170)}, ${Math.min(255, g + 170)}, ${Math.min(255, b + 170)})`,
    200: `rgb(${Math.min(255, r + 120)}, ${Math.min(255, g + 120)}, ${Math.min(255, b + 120)})`,
    300: `rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)})`,
    400: `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`,
    500: hex,
    600: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`,
    700: `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`,
    800: `rgb(${Math.max(0, r - 70)}, ${Math.max(0, g - 70)}, ${Math.max(0, b - 70)})`,
    900: `rgb(${Math.max(0, r - 90)}, ${Math.max(0, g - 90)}, ${Math.max(0, b - 90)})`,
  };
}
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      accentColor: '#7c6af7',
      setTheme: (theme, accentColor) => {
        set((state) => {
          const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          const color = accentColor || state.accentColor;
          const shades = generateColorShades(color, isDark);
          Object.entries(shades).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-accent-${key}`, value);
          });
          return { theme };
        });
      },
      setAccentColor: (color) => {
        set({ accentColor: color });
        const isDark = document.documentElement.classList.contains('dark');
        const shades = generateColorShades(color, isDark);
        Object.entries(shades).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--color-accent-${key}`, value);
        });
        document.documentElement.style.setProperty('--color-accent', color);
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          const isDark = newTheme === 'dark';
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          const shades = generateColorShades(state.accentColor, isDark);
          Object.entries(shades).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-accent-${key}`, value);
          });
          return { theme: newTheme };
        });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);