import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { UserPreferences } from '../../lib/types';
import { DEFAULT_PREFERENCES } from '../../lib/constants';

// AI 返回的格式
type AIRecipeItem = {
  day?: string; // 向后兼容，新格式不需要
  name: string;
  img: string;
  ingredients: Array<{ name: string; amount: string }>;
  steps: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  cook_time: number;
  tags: string[];
  avoid_match: boolean;
};

type AIResponse = {
  daily_menu: AIRecipeItem[];
};

// 将 AI 返回格式转换为项目 Recipe 格式
function convertAIRecipeToRecipe(aiRecipe: AIRecipeItem, index: number): any {
  // 从 tags 中提取 tastes, styles, dietTags
  const tastes: string[] = [];
  const styles: string[] = [];
  const dietTags: string[] = [];
  const tools: string[] = [];

  for (const tag of aiRecipe.tags) {
    if (['清淡', '微辣', '重口', '酸甜', '咸香'].includes(tag)) {
      tastes.push(tag);
    } else if (['中餐', '西餐', '日式', '韩式', '快手菜', '家常菜', '轻食', '汤粥类'].includes(tag)) {
      styles.push(tag);
    } else if (['普通均衡', '减脂', '健身增肌', '控糖', '素食'].includes(tag)) {
      dietTags.push(tag);
    } else if (['电饭煲', '平底锅', '空气炸锅', '微波炉', '烤箱'].includes(tag)) {
      tools.push(tag);
    }
  }

  // 转换食材格式
  const ingredients = aiRecipe.ingredients.map(ing => ({
    name: ing.name,
    quantity: ing.amount,
    category: inferCategory(ing.name),
  }));

  return {
    id: `ai_${Date.now()}_${index}`,
    name: aiRecipe.name,
    image: aiRecipe.img || '/favicon.ico',
    styles: styles.length > 0 ? styles : ['家常菜'],
    tastes: tastes.length > 0 ? tastes : ['清淡'],
    dietTags: dietTags.length > 0 ? dietTags : ['普通均衡'],
    cookTime: aiRecipe.cook_time,
    tools: tools.length > 0 ? tools : ['平底锅'],
    ingredients,
    steps: aiRecipe.steps,
    nutrition: {
      kcal: aiRecipe.nutrition.calories,
      proteinG: aiRecipe.nutrition.protein,
      carbG: aiRecipe.nutrition.carbs,
      fatG: aiRecipe.nutrition.fat,
    },
    avoidTriggers: aiRecipe.avoid_match ? [] : undefined,
  };
}

// 简单的食材分类推断
function inferCategory(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('肉') || nameLower.includes('鸡') || nameLower.includes('鱼') || nameLower.includes('虾')) {
    return '肉类';
  }
  if (nameLower.includes('菜') || nameLower.includes('椒') || nameLower.includes('菇') || nameLower.includes('萝卜')) {
    return '蔬菜';
  }
  if (nameLower.includes('蛋') || nameLower.includes('奶')) {
    return '蛋奶';
  }
  if (nameLower.includes('米') || nameLower.includes('面') || nameLower.includes('饭') || nameLower.includes('粉')) {
    return '主食';
  }
  if (nameLower.includes('豆') || nameLower.includes('豆腐')) {
    return '豆制品';
  }
  if (nameLower.includes('油') || nameLower.includes('盐') || nameLower.includes('酱') || nameLower.includes('醋')) {
    return '调料';
  }
  return '其他';
}

// 获取第二天的日期（格式：YYYY-MM-DD）
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// 构建 prompt
function buildPrompt(preferences: UserPreferences): string {
  const tomorrowDate = getTomorrowDate();
  const promptTemplate = `
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
2. 生成 2 个菜式（两道菜），每个菜的 cook_time ≤ PREFERENCES.cook_time。
3. 尽量**不包含** PREFERENCES.avoid 中的食材；若包含则设置 avoid_match 为 true。
4. nutrition.calories 单位为 kcal（整数），protein/carbs/fat 单位为克（数值型）。
5. tags 中必须包含 PREFERENCES.taste（如"微辣"）和 style（如"家常菜"）之一或两者，并视 diet_goal 加入相应标签（如"减脂"）。
6. ingredients.amount 使用中文单位（例如 "1个", "150g", "1碗"）。
7. steps 数量为 3–8 条，可在给定时间内完成，语言简明。
8. img 必须是可访问的 URL（占位可接受，可以使用 "https://via.placeholder.com/300x200"）。
9. 若遇到歧义，优先满足 diet_goal、cook_time 和 avoid 三项约束。
10. tags 数组应包含：口味标签（taste）、菜式标签（style）、饮食目标标签（diet_goal）、使用的厨具（tools）。
11. 两道菜应该搭配合理，营养均衡，适合作为第二天的午餐。

现在基于以下偏好生成第二天的菜单（${tomorrowDate}）：
${JSON.stringify(preferences, null, 2)}
`;
  return promptTemplate;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preferences: UserPreferences = body.preferences || DEFAULT_PREFERENCES;

    // 获取阿里云 API Key（从环境变量）
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DASHSCOPE_API_KEY 未配置，请在 .env.local 中设置' },
        { status: 500 }
      );
    }

    // 构建 prompt
    const prompt = buildPrompt(preferences);

    // 初始化 OpenAI 客户端（兼容阿里云 DashScope）
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    // 调用阿里云 DashScope API（使用 OpenAI 兼容接口）
    const completion = await openai.chat.completions.create({
      model: 'qwen3-max-2025-09-23',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    // todo 下面连个日志不上
    console.log("todo ----ai 返回的内容：");
    console.log(completion.choices[0]?.message);


    // 提取 AI 返回的文本内容
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('AI 返回格式异常:', JSON.stringify(completion, null, 2));
      return NextResponse.json(
        { error: 'AI 返回格式异常，未获取到内容' },
        { status: 500 }
      );
    }

    // 尝试解析 JSON（可能包含 markdown 代码块）
    let jsonStr = content.trim();
    // 移除可能的 markdown 代码块标记
    if (jsonStr.startsWith('```')) {
      const lines = jsonStr.split('\n');
      const startIdx = lines.findIndex(l => l.trim().startsWith('{'));
      const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === '```');
      if (startIdx >= 0 && endIdx > startIdx) {
        jsonStr = lines.slice(startIdx, endIdx).join('\n');
      } else if (startIdx >= 0) {
        jsonStr = lines.slice(startIdx).join('\n');
      }
    }

    let aiResponse: AIResponse;
    try {
      aiResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON 解析失败:', jsonStr);
      return NextResponse.json(
        { error: `AI 返回的 JSON 解析失败: ${parseError}` },
        { status: 500 }
      );
    }

    // 获取菜单数据（仅支持 daily_menu）
    const menuItems = aiResponse.daily_menu || [];
    
    // 确保只有2道菜
    const limitedItems = menuItems.slice(0, 2);
    
    if (limitedItems.length < 2) {
      return NextResponse.json(
        { error: `AI 返回的菜谱数量不足，期望2道菜，实际${limitedItems.length}道` },
        { status: 500 }
      );
    }

    // 转换为项目格式
    const recipes = limitedItems.map((item, index) =>
      convertAIRecipeToRecipe(item, index)
    );

    // 获取第二天日期
    const targetDate = getTomorrowDate();

    return NextResponse.json({ 
      recipes,
      targetDate 
    });
  } catch (error: any) {
    console.error('生成菜单错误:', error);
    return NextResponse.json(
      { error: error.message || '生成菜单失败' },
      { status: 500 }
    );
  }
}

