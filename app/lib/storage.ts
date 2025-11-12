import type { UserPreferences, DailyMenu, Recipe } from './types';
import { DEFAULT_PREFERENCES } from './constants';

const PREF_KEY = 'fanban_preferences_v1';
const HISTORY_KEY = 'fanban_history_v1';
const LAST_MENU_KEY = 'fanban_last_menu_v1';
const AI_RECIPES_KEY = 'fanban_ai_recipes_v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  return safeParse<UserPreferences>(localStorage.getItem(PREF_KEY)) ?? DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export function getHistory(): DailyMenu[] {
  if (typeof window === 'undefined') return [];
  return safeParse<DailyMenu[]>(localStorage.getItem(HISTORY_KEY)) ?? [];
}

export function addToHistory(menu: DailyMenu) {
  if (typeof window === 'undefined') return;
  const hist = getHistory();
  hist.unshift(menu);
  // 只保留最近20条
  const trimmed = hist.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function getLastMenu(): DailyMenu | null {
  if (typeof window === 'undefined') return null;
  return safeParse<DailyMenu>(localStorage.getItem(LAST_MENU_KEY));
}

export function setLastMenu(menu: DailyMenu) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_MENU_KEY, JSON.stringify(menu));
}

// AI 生成的菜谱存储
export function saveAIRecipes(recipes: Recipe[]) {
  if (typeof window === 'undefined') return;
  const existing = getAIRecipes();
  const recipeMap = new Map(existing.map(r => [r.id, r]));
  recipes.forEach(r => recipeMap.set(r.id, r));
  localStorage.setItem(AI_RECIPES_KEY, JSON.stringify(Array.from(recipeMap.values())));
}

export function getAIRecipes(): Recipe[] {
  if (typeof window === 'undefined') return [];
  return safeParse<Recipe[]>(localStorage.getItem(AI_RECIPES_KEY)) ?? [];
}

export function getAIRecipeById(id: string): Recipe | undefined {
  const recipes = getAIRecipes();
  return recipes.find(r => r.id === id);
}


