import * as React from 'react';

const ThemeContext = React.createContext();

// Helper to check if running in browser
const isBrowser = typeof window !== 'undefined';

const ThemeProvider = ({ children }) => {
  // Default theme for SSR, will be updated on client
  const [theme, setTheme] = React.useState('light');

  React.useEffect(() => {
    // This effect runs only on the client after hydration
    if (!isBrowser) {
      // Should not happen if isBrowser check is done correctly before calling this effect's dependent functions
      // but as a safeguard for the logic inside.
      return;
    }

    let initialUserTheme = 'light'; // Default
    // Try to get theme from localStorage
    try {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme) {
        initialUserTheme = storedTheme;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Fallback to system preference if no theme in localStorage
        initialUserTheme = 'dark';
      }
    } catch (e) {
      console.warn('Could not access localStorage or matchMedia for theme', e);
      // Keep default 'light' theme if localStorage/matchMedia fails
    }

    setTheme(initialUserTheme);

  }, []); // Empty dependency array: runs once on mount (client-side)

  React.useEffect(() => {
    // This effect runs when 'theme' changes, and only on client
    if (!isBrowser) {
      return;
    }

    const root = window.document.documentElement;
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);

    try {
      window.localStorage.setItem('theme', theme);
    } catch (e) {
      // Handle potential errors with localStorage (e.g., private browsing)
      console.warn('Could not save theme to localStorage', e);
    }
  }, [theme]); // Runs when theme state changes (client-side)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
