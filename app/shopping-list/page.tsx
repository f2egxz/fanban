"use client";
import { useEffect, useState } from "react";
import { getLastMenu } from "../lib/storage";
import { buildShoppingList } from "../lib/shoppingList";
import Link from "next/link";

export default function ShoppingListPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const menu = getLastMenu();
    if (!menu) return;
    const sl = buildShoppingList(menu);
    const lines: string[] = [];
    lines.push(`购物清单（菜单 ${sl.fromMenuId}）`);
    lines.push('');
    for (const item of sl.items) {
      lines.push(
        `- ${item.category ? `[${item.category}] ` : ""}${item.name}${item.quantity ? ` · ${item.quantity}` : ""}  （${item.recipes.join('、')}）`
      );
    }
    setText(lines.join('\n'));
  }, []);

  const onCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(()=>setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <Link href="/menu" className="text-sm text-blue-600 underline">← 返回菜单</Link>
        <h2 className="text-xl font-semibold mt-2">购物清单</h2>
        <p className="text-xs text-gray-500 mt-1">已按分类与名称排序，可复制或导出为图片/PDF（建议使用系统分享）</p>

        <textarea
          className="w-full h-80 mt-4 p-3 border rounded-md text-sm"
          value={text}
          readOnly
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={onCopy} className="h-12 rounded-full border">
            {copied ? "已复制" : "复制清单"}
          </button>
          <button
            onClick={() => window.print()}
            className="h-12 rounded-full bg-black text-white"
          >
            导出 PDF/图片
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-3">
          提示：可通过浏览器的“添加到主屏幕”与“打印/导出”来保存。
        </div>
      </div>
    </div>
  );
}


