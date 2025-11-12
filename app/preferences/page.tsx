"use client";
import { useEffect, useState } from "react";
import PreferenceGroup from "../components/PreferenceGroup";
import { DEFAULT_PREFERENCES } from "../lib/constants";
import { getPreferences, savePreferences } from "../lib/storage";
import type { UserPreferences } from "../lib/types";

const TASTE = ['清淡','微辣','重口','酸甜','咸香'].map(v=>({label:v,value:v}));
const GOAL = ['普通均衡','减脂','健身增肌','控糖','素食'].map(v=>({label:v,value:v}));
const TIME = [15,30,60].map(v=>({label:`${v} 分钟`, value:String(v)}));
const TOOLS = ['电饭煲','平底锅','空气炸锅','微波炉','烤箱'].map(v=>({label:v,value:v}));
const AVOID = ['猪肉','牛肉','羊肉','海鲜','辣椒','洋葱','香菜'].map(v=>({label:v,value:v}));
const STYLE = ['中餐','西餐','日式','韩式','快手菜','家常菜','轻食','汤粥类'].map(v=>({label:v,value:v}));

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  useEffect(() => {
    setPrefs(getPreferences());
  }, []);

  const onSave = () => {
    savePreferences(prefs);
    window.history.back();
  };
  const onSkip = () => {
    savePreferences(DEFAULT_PREFERENCES);
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold">偏好设置</h2>
        <p className="text-gray-500 text-sm mt-1">Tag + 图标 + 轻交互，可跳过使用默认值</p>

        <div className="mt-4">
          <PreferenceGroup
            title="口味偏好（多选）"
            options={TASTE}
            multiple
            value={prefs.taste}
            onChange={v => setPrefs(prev => ({ ...prev, taste: v as string[] }))}
          />
          <PreferenceGroup
            title="饮食目标（单选）"
            options={GOAL}
            value={prefs.diet_goal}
            onChange={v => setPrefs(prev => ({ ...prev, diet_goal: v as string }))}
          />
          <PreferenceGroup
            title="烹饪时长（单选）"
            options={TIME}
            value={String(prefs.cook_time)}
            onChange={v => setPrefs(prev => ({ ...prev, cook_time: Number(v) as any }))}
          />
          <PreferenceGroup
            title="厨具设备（多选）"
            options={TOOLS}
            multiple
            value={prefs.tools}
            onChange={v => setPrefs(prev => ({ ...prev, tools: v as string[] }))}
          />
          <PreferenceGroup
            title="忌口食材（多选）"
            options={AVOID}
            multiple
            value={prefs.avoid}
            onChange={v => setPrefs(prev => ({ ...prev, avoid: v as string[] }))}
          />
          <PreferenceGroup
            title="菜式偏好（多选）"
            options={STYLE}
            multiple
            value={prefs.style}
            onChange={v => setPrefs(prev => ({ ...prev, style: v as string[] }))}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onSkip} className="h-12 rounded-full border">
            跳过（默认）
          </button>
          <button onClick={onSave} className="h-12 rounded-full bg-black text-white">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}


