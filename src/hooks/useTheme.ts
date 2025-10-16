import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { preferencesAtom } from '@/store/preferences';

export function useTheme() {
  const [preferences, setPreferences] = useAtom(preferencesAtom);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Determine the actual theme to apply
    let theme = preferences.theme;
    if (preferences.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      theme = systemTheme;
    }

    // Apply the theme
    root.classList.add(theme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#111827' : '#ffffff'
      );
    }
  }, [preferences.theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (preferences.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.theme]);

  return { preferences, setPreferences };
}