"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { generateDailyMenuWithAI } from "./lib/generator";
import { getPreferences, addToHistory, setLastMenu, getLastMenu } from "./lib/storage";
import { DEFAULT_PREFERENCES } from "./lib/constants";
import type { UserPreferences, DailyMenu } from "./lib/types";

export default function Home() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const lastMenu = useMemo<DailyMenu | null>(() => getLastMenu(), []);

  useEffect(() => {
    setPrefs(getPreferences());
  }, []);

  const onGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const menu = await generateDailyMenuWithAI(prefs);
      addToHistory(menu);
      setLastMenu(menu);
      window.location.href = "/menu";
    } catch (error) {
      console.error('生成菜单失败:', error);
      alert('生成菜单失败，请稍后重试');
      setLoading(false);
    }
  }, [prefs]);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">饭伴 FanBan</h1>
        <p className="text-gray-600 mt-2">明天想吃什么？一键生成明天菜单</p>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 w-full h-12 rounded-full bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '生成中...' : '一键生成菜单'}
        </button>

        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">最近偏好</div>
          <div className="text-sm">
            口味：{prefs.taste.join("、") || "—"} · 目标：{prefs.diet_goal} · 时长：
            {prefs.cook_time} 分钟
          </div>
          <div className="text-sm mt-1">
            厨具：{prefs.tools.join("、") || "—"}
          </div>
          <div className="text-sm mt-1">
            忌口：{prefs.avoid.join("、") || "—"}
          </div>
          <div className="text-sm mt-1">
            菜式：{prefs.style.join("、") || "—"}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link href="/preferences" className="border rounded-lg p-3 text-center">
            偏好设置
          </Link>
          <Link href="/history" className="border rounded-lg p-3 text-center">
            历史菜单
          </Link>
        </div>

        {lastMenu ? (
          <div className="mt-6">
            <Link href="/menu" className="text-sm text-blue-600">
              继续查看上次菜单 →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
