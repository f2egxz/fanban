"use client";
import { useEffect, useMemo, useState } from "react";
import { getLastMenu, getPreferences, setLastMenu, addToHistory } from "../lib/storage";
import { generateDailyMenu, generateDailyMenuWithAI, swapRecipe } from "../lib/generator";
import type { UserPreferences, DailyMenu } from "../lib/types";
import RecipeCard from "../components/RecipeCard";
import Link from "next/link";

export default function MenuPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = getPreferences();
    setPrefs(p);
    const m = getLastMenu();
    if (m) {
      setMenu(m);
    } else {
      // 如果没有历史菜单，异步生成
      setLoading(true);
      generateDailyMenuWithAI(p)
        .then(m => {
          addToHistory(m);
          setLastMenu(m);
          setMenu(m);
        })
        .catch(err => {
          console.error('生成菜单失败:', err);
          // 回退到静态数据
          const fallback = generateDailyMenu(p);
          addToHistory(fallback);
          setLastMenu(fallback);
          setMenu(fallback);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const onRegenerate = async () => {
    if (!prefs) return;
    setLoading(true);
    try {
      const m = await generateDailyMenuWithAI(prefs);
      addToHistory(m);
      setLastMenu(m);
      setMenu(m);
    } catch (error) {
      console.error('重新生成失败:', error);
      // 回退到静态数据
      const fallback = generateDailyMenu(prefs);
      addToHistory(fallback);
      setLastMenu(fallback);
      setMenu(fallback);
    } finally {
      setLoading(false);
    }
  };

  const onSwap = (index: number) => {
    if (!menu || !prefs) return;
    const next = swapRecipe(menu, index, prefs);
    setMenu(next);
    setLastMenu(next);
  };

  if (loading && !menu) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">正在生成菜单...</div>
          <div className="text-sm text-gray-500 mt-2">请稍候</div>
        </div>
      </div>
    );
  }

  if (!menu) return null;

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日（周${weekday}）`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">菜单</h2>
          <button 
            onClick={onRegenerate} 
            disabled={loading}
            className="text-sm underline disabled:opacity-50"
          >
            {loading ? '生成中...' : '重新生成'}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {menu.targetDate ? formatDate(menu.targetDate) : '第二天'} · 点击菜名查看菜谱 · 支持换菜
        </div>

        <div className="mt-4">
          {menu.items.map((item, idx) => (
            <div key={item.recipeId || idx}>
              <div className="text-sm text-gray-500 mb-1">
                第{item.index || idx + 1}道菜
              </div>
              <RecipeCard recipeId={item.recipeId} onSwap={() => onSwap(item.index || idx + 1)} />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/shopping-list" className="block w-full h-12 rounded-full bg-black text-white text-center leading-[48px]">
            生成购物清单
          </Link>
        </div>
      </div>
    </div>
  );
}


