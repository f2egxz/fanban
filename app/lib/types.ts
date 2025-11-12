export type Taste = '清淡' | '微辣' | '重口' | '酸甜' | '咸香';
export type DietGoal = '普通均衡' | '减脂' | '健身增肌' | '控糖' | '素食';
export type CookTime = 15 | 30 | 60;
export type Tool =
  | '电饭煲'
  | '平底锅'
  | '空气炸锅'
  | '微波炉'
  | '烤箱';
export type Avoid =
  | '猪肉'
  | '牛肉'
  | '羊肉'
  | '海鲜'
  | '辣椒'
  | '洋葱'
  | '香菜';
export type Style =
  | '中餐'
  | '西餐'
  | '日式'
  | '韩式'
  | '快手菜'
  | '家常菜'
  | '轻食'
  | '汤粥类';

export type UserPreferences = {
  taste: Taste[];
  diet_goal: DietGoal;
  cook_time: CookTime;
  tools: Tool[];
  avoid: Avoid[];
  style: Style[];
};

export type Ingredient = {
  name: string;
  quantity?: string;
  category?: string; // 用于购物清单分类：蔬菜、肉类、主食、调料等
  avoidTags?: Avoid[]; // 触发忌口过滤
};

export type Recipe = {
  id: string;
  name: string;
  image: string;
  styles: Style[];
  tastes: Taste[];
  dietTags: DietGoal[]; // 可适配的饮食目标
  cookTime: CookTime | number;
  tools: Tool[];
  ingredients: Ingredient[];
  steps: string[];
  nutrition?: {
    kcal?: number;
    proteinG?: number;
    carbG?: number;
    fatG?: number;
  };
  tips?: string[];
  avoidTriggers?: Avoid[]; // 触发忌口过滤
};

export type MenuItem = {
  recipeId: string;
  index?: number; // 第几道菜（1或2）
};

export type DailyMenu = {
  id: string; // 用于历史记录
  createdAt: number;
  targetDate: string; // 目标日期（第二天），格式：YYYY-MM-DD
  preferencesSnapshot: UserPreferences;
  items: MenuItem[]; // 2道菜
};

export type ShoppingListItem = {
  name: string;
  quantity?: string;
  category?: string;
  recipes: string[]; // 由哪些菜谱需要
};

export type ShoppingList = {
  fromMenuId: string;
  generatedAt: number;
  items: ShoppingListItem[];
};

export type GenerateOptions = {
  count?: number; // 默认 2（两道菜）
  excludeRecipeIds?: string[]; // 用于"换菜"
};


