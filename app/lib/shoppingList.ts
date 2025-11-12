import { RECIPES } from '../data/recipes';
import { recipeById } from './generator';
import type { ShoppingList, ShoppingListItem, DailyMenu } from './types';
import { CATEGORY_ORDER } from './constants';

export function buildShoppingList(menu: DailyMenu): ShoppingList {
  const aggregate = new Map<string, ShoppingListItem>();
  for (const item of menu.items) {
    const rid = item.recipeId;
    // 使用 recipeById 可以同时获取静态数据和 AI 生成的菜谱
    const recipe = recipeById(rid);
    if (!recipe) continue;
    for (const ing of recipe.ingredients) {
      const key = `${ing.name}|${ing.category ?? ''}|${ing.quantity ?? ''}`;
      const exist = aggregate.get(key);
      if (exist) {
        if (!exist.recipes.includes(recipe.name)) exist.recipes.push(recipe.name);
      } else {
        aggregate.set(key, {
          name: ing.name,
          quantity: ing.quantity,
          category: ing.category,
          recipes: [recipe.name],
        });
      }
    }
  }
  const items = Array.from(aggregate.values()).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category ?? '其他');
    const bi = CATEGORY_ORDER.indexOf(b.category ?? '其他');
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name, 'zh');
  });
  return {
    fromMenuId: menu.id,
    generatedAt: Date.now(),
    items,
  };
}


