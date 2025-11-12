import { RECIPES } from '../data/recipes';
import { DEFAULT_PREFERENCES } from './constants';
import type {
  GenerateOptions,
  Recipe,
  UserPreferences,
  DailyMenu,
} from './types';

function matchesAvoid(recipe: Recipe, prefs: UserPreferences): boolean {
  if (recipe.avoidTriggers && recipe.avoidTriggers.some(a => prefs.avoid.includes(a))) return false;
  for (const ing of recipe.ingredients) {
    if (ing.avoidTags && ing.avoidTags.some(a => prefs.avoid.includes(a))) return false;
    if (prefs.avoid.includes(ing.name as any)) return false;
  }
  return true;
}

function matchesTools(recipe: Recipe, prefs: UserPreferences): boolean {
  if (recipe.tools.length === 0) return true;
  return recipe.tools.some(t => prefs.tools.includes(t));
}

function matchesStyle(recipe: Recipe, prefs: UserPreferences): boolean {
  if (prefs.style.length === 0) return true;
  return recipe.styles.some(s => prefs.style.includes(s));
}

function matchesTime(recipe: Recipe, prefs: UserPreferences): boolean {
  const t = typeof recipe.cookTime === 'number' ? recipe.cookTime : 60;
  return t <= prefs.cook_time;
}

function baseFilter(recipe: Recipe, prefs: UserPreferences): boolean {
  return (
    matchesAvoid(recipe, prefs) &&
    matchesTools(recipe, prefs) &&
    matchesStyle(recipe, prefs) &&
    matchesTime(recipe, prefs) &&
    recipe.dietTags.includes(prefs.diet_goal)
  );
}

function scoreRecipe(recipe: Recipe, prefs: UserPreferences): number {
  let score = 0;
  // 味道匹配
  score += recipe.tastes.some(t => prefs.taste.includes(t)) ? 2 : 0;
  // 风格匹配
  score += recipe.styles.some(s => prefs.style.includes(s)) ? 2 : 0;
  // 时间越短越高
  const t = typeof recipe.cookTime === 'number' ? recipe.cookTime : 60;
  score += Math.max(0, 3 - Math.floor((t - 15) / 15)); // 15->3,30->2,45->1,60->0
  // 工具匹配
  score += recipe.tools.some(tool => prefs.tools.includes(tool)) ? 1 : 0;
  return score;
}

function pickTop(
  candidates: Recipe[],
  prefs: UserPreferences,
  count: number,
  exclude: Set<string>
): Recipe[] {
  const sorted = candidates
    .filter(r => !exclude.has(r.id))
    .map(r => ({ r, s: scoreRecipe(r, prefs) }))
    .sort((a, b) => b.s - a.s);
  // 为避免重复与过度集中，进行简单的“层内随机”
  const result: Recipe[] = [];
  const buckets: Record<number, Recipe[]> = {};
  for (const { r, s } of sorted) {
    if (!buckets[s]) buckets[s] = [];
    buckets[s].push(r);
  }
  const scores = Object.keys(buckets)
    .map(n => parseInt(n, 10))
    .sort((a, b) => b - a);
  for (const sc of scores) {
    const arr = buckets[sc];
    while (arr.length && result.length < count) {
      const idx = Math.floor(Math.random() * arr.length);
      result.push(arr.splice(idx, 1)[0]);
    }
    if (result.length >= count) break;
  }
  return result;
}

// 获取第二天的日期（格式：YYYY-MM-DD）
function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function generateDailyMenu(
  prefInput?: Partial<UserPreferences>,
  options?: GenerateOptions
): DailyMenu {
  const prefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...prefInput,
    // 合并数组字段
    taste: prefInput?.taste ?? DEFAULT_PREFERENCES.taste,
    tools: prefInput?.tools ?? DEFAULT_PREFERENCES.tools,
    avoid: prefInput?.avoid ?? DEFAULT_PREFERENCES.avoid,
    style: prefInput?.style ?? DEFAULT_PREFERENCES.style,
  };
  const count = options?.count ?? 2; // 默认2道菜
  const exclude = new Set(options?.excludeRecipeIds ?? []);

  const candidates = RECIPES.filter(r => baseFilter(r, prefs));
  const chosen = pickTop(candidates, prefs, count, exclude);
  // 若不够，回退到不严格过滤（只过滤忌口与饮食目标），保证能生成
  if (chosen.length < count) {
    const relaxed = RECIPES.filter(
      r =>
        matchesAvoid(r, prefs) &&
        r.dietTags.includes(prefs.diet_goal) &&
        !exclude.has(r.id)
    );
    const fill = pickTop(relaxed, prefs, count - chosen.length, new Set(chosen.map(c => c.id)));
    chosen.push(...fill);
  }
  // 如果还不够，最后兜底随机补全
  if (chosen.length < count) {
    const pool = RECIPES.filter(r => !exclude.has(r.id));
    while (chosen.length < count && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      const r = pool.splice(idx, 1)[0];
      if (!chosen.some(c => c.id === r.id)) chosen.push(r);
    }
  }

  // 构建菜单（2道菜）
  const items = chosen.slice(0, 2).map((recipe, index) => ({
    recipeId: recipe.id,
    index: index + 1,
  }));

  return {
    id: `menu_${Date.now()}`,
    createdAt: Date.now(),
    targetDate: getTomorrowDateString(),
    preferencesSnapshot: prefs,
    items,
  };
}

export function swapRecipe(
  menu: DailyMenu,
  index: number, // 第几道菜（1或2）
  prefs: UserPreferences
): DailyMenu {
  const exclude = new Set(menu.items.map(i => i.recipeId));
  const candidates = RECIPES.filter(r => baseFilter(r, prefs) && !exclude.has(r.id));
  const picked = pickTop(candidates, prefs, 1, exclude)[0] ?? RECIPES.find(r => !exclude.has(r.id));
  if (!picked) return menu;
  return {
    ...menu,
    items: menu.items.map(i => (i.index === index ? { ...i, recipeId: picked.id } : i)),
  };
}

export function recipeById(id: string): Recipe | undefined {
  // 先查静态数据
  const staticRecipe = RECIPES.find(r => r.id === id);
  if (staticRecipe) return staticRecipe;
  
  // 再查 AI 生成的菜谱（需要动态导入避免 SSR 问题）
  if (typeof window !== 'undefined') {
    const { getAIRecipeById } = require('./storage');
    return getAIRecipeById(id);
  }
  return undefined;
}

// 异步生成菜单（使用 AI）
export async function generateDailyMenuWithAI(
  prefInput?: Partial<UserPreferences>,
  options?: GenerateOptions
): Promise<DailyMenu> {
  const prefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...prefInput,
    taste: prefInput?.taste ?? DEFAULT_PREFERENCES.taste,
    tools: prefInput?.tools ?? DEFAULT_PREFERENCES.tools,
    avoid: prefInput?.avoid ?? DEFAULT_PREFERENCES.avoid,
    style: prefInput?.style ?? DEFAULT_PREFERENCES.style,
  };

  try {
    const response = await fetch('/api/generate-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: prefs }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '生成菜单失败');
    }

    const { recipes, targetDate } = await response.json();
    
    // 保存 AI 生成的菜谱到本地存储
    if (typeof window !== 'undefined') {
      const { saveAIRecipes } = require('./storage');
      saveAIRecipes(recipes);
    }

    // 构建菜单（2道菜）
    const items = recipes.slice(0, 2).map((recipe: any, index: number) => ({
      recipeId: recipe.id,
      index: index + 1,
    }));

    return {
      id: `menu_${Date.now()}`,
      createdAt: Date.now(),
      targetDate: targetDate || getTomorrowDateString(),
      preferencesSnapshot: prefs,
      items,
    };
  } catch (error: any) {
    console.error('AI 生成菜单失败，回退到静态数据:', error);
    // 失败时回退到静态数据生成
    return generateDailyMenu(prefInput, options);
  }
}


