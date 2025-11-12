import type { UserPreferences } from './types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  taste: ['清淡'],
  diet_goal: '普通均衡',
  cook_time: 30,
  tools: ['平底锅'],
  avoid: [],
  style: ['家常菜', '快手菜'],
};

export const CATEGORY_ORDER = [
  '蔬菜',
  '肉类',
  '蛋奶',
  '主食',
  '豆制品',
  '调料',
  '其他',
];



const prompt = `
你是一个结构化菜谱生成器。输入变量名为 PREFERENCES，值为合法的 JSON 偏好对象（包含 taste, diet_goal, cook_time, tools, avoid, style）。根据 PREFERENCES 生成一个仅包含一个 JSON 对象的输出，格式严格如下：

{
  "daily_menu": [
    {
      "name": "菜名",
      "img": "图片URL",
      "ingredients": [
        { "name": "食材名", "amount": "数量或重量" }
      ],
      "steps": ["步骤1", "步骤2", "..."],
      "nutrition": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      },
      "cook_time": 0,
      "tags": ["tag1", "tag2"],
      "avoid_match": false
    },
    { "name": "第二道菜名", ... }
  ]
}

执行规则：
1. 只输出上面结构的 JSON（无任何额外文字）。
2. 生成 2 道菜，每个菜的 cook_time ≤ PREFERENCES.cook_time。
3. 尽量**不包含** PREFERENCES.avoid 中的食材；若包含则设置 avoid_match 为 true。
4. nutrition.calories 单位为 kcal（整数），protein/carbs/fat 单位为克（数值型）。
5. tags 中必须包含 PREFERENCES.taste（如“微辣”）和 style（如“家常菜”）之一或两者，并视 diet_goal 加入相应标签（如“减脂”）。
6. ingredients.amount 使用中文单位（例如 "1个", "150g", "1碗"）。
7. steps 数量为 3–8 条，可在给定时间内完成，语言简明。
8. img 必须是可访问的 URL（占位可接受）。
9. 若遇到歧义，优先满足 diet_goal、cook_time 和 avoid 三项约束。

现在基于以下偏好生成菜单（把下面替换为实际传入的 JSON 偏好）：
{{PREFERENCES}}
`

