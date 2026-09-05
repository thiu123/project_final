import { computed, ref } from "vue";

export type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "theme";

const preference = ref<ThemePreference>("system");
const systemPrefersDark = ref(false);
let initialized = false;

function applyThemeClass() {
  if (!import.meta.client) return;
  const isDark =
    preference.value === "dark" ||
    (preference.value === "system" && systemPrefersDark.value);
  document.documentElement.classList.toggle("dark", isDark);
}

function initTheme() {
  if (initialized || !import.meta.client) return;
  initialized = true;

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
  if (stored === "light" || stored === "dark" || stored === "system") {
    preference.value = stored;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  systemPrefersDark.value = media.matches;
  media.addEventListener("change", (e) => {
    systemPrefersDark.value = e.matches;
    applyThemeClass();
  });

  applyThemeClass();
}

/**
 * Class-based dark mode with localStorage persistence.
 * Respects prefers-color-scheme until the user chooses explicitly.
 * A no-FOUC inline script in nuxt.config.ts applies the class before paint.
 */
export function useTheme() {
  initTheme();

  const isDark = computed(
    () =>
      preference.value === "dark" ||
      (preference.value === "system" && systemPrefersDark.value)
  );

  function setTheme(value: ThemePreference) {
    preference.value = value;
    if (import.meta.client) {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    }
    applyThemeClass();
  }

  function toggleTheme() {
    setTheme(isDark.value ? "light" : "dark");
  }

  return { preference, isDark, setTheme, toggleTheme };
}
