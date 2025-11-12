"use client";
import { useEffect, useState } from "react";
import { getHistory, setLastMenu } from "../lib/storage";
import Link from "next/link";
import { recipeById } from "../lib/generator";

export default function HistoryPage() {
  const [history, setHistory] = useState(() => getHistory());
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const useMenu = (id: string) => {
    const m = history.find(h => h.id === id);
    if (!m) return;
    setLastMenu(m);
    window.location.href = "/menu";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <Link href="/" className="text-sm text-blue-600 underline">← 返回首页</Link>
        <h2 className="text-xl font-semibold mt-2">历史菜单</h2>
        <div className="mt-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-sm text-gray-500">暂无历史记录</div>
          ) : null}
          {history.map(h => (
            <div key={h.id} className="border rounded-lg p-3">
              <div className="text-sm text-gray-500">
                {new Date(h.createdAt).toLocaleString()}
              </div>
              <div className="text-sm mt-1">
                偏好：{h.preferencesSnapshot.taste.join('、')} · {h.preferencesSnapshot.diet_goal} · {h.preferencesSnapshot.cook_time} 分钟
              </div>
              {h.targetDate && (
                <div className="text-xs text-gray-500 mt-1">
                  日期：{h.targetDate}
                </div>
              )}
              <div className="mt-2 space-y-1">
                {h.items.map((it, idx) => {
                  const r = recipeById(it.recipeId);
                  return (
                    <div key={it.recipeId || idx} className="text-xs text-gray-700">
                      <span className="mr-1">第{it.index || idx + 1}道菜：</span>
                      <span>{r?.name ?? it.recipeId}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => useMenu(h.id)} className="mt-3 h-9 px-3 rounded-full border text-sm">
                使用此菜单
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


