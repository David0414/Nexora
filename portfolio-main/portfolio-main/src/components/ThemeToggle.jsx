import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === "light" ? "light" : "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#e9e7de" : "#08090b");
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch {
      // Theme switching still works when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <button type="button" className={`theme-toggle ${theme === "light" ? "is-light" : "is-dark"}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === "light"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>
      <span className="theme-toggle-thumb" aria-hidden="true" />
      <svg className="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </svg>
      <svg className="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 13.3A8.6 8.6 0 0 1 10.7 3.5 8.6 8.6 0 1 0 20.5 13.3Z" />
      </svg>
    </button>
  );
};

export default ThemeToggle;
