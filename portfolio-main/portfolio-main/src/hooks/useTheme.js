import { useSyncExternalStore } from "react";

const getTheme = () => document.documentElement.dataset.theme === "light" ? "light" : "dark";

const subscribe = (onChange) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

export default function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => "dark");
}
