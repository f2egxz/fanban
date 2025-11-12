"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { recipeById } from "../../lib/generator";
import Link from "next/link";
import type { Recipe } from "../../lib/types";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    setReady(true);
    const r = recipeById(String(params?.id));
    setRecipe(r);
  }, [params?.id]);
  
  if (!ready) return null;
  if (!recipe) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <p>未找到菜谱</p>
        <Link href="/menu" className="text-blue-600 text-sm underline">返回菜单</Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <Link href="/menu" className="text-sm text-blue-600 underline">← 返回菜单</Link>
        <h2 className="text-xl font-semibold mt-2">{recipe.name}</h2>
        <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover rounded mt-3 bg-gray-100" />
        <div className="text-sm text-gray-500 mt-2">
          {recipe.styles.join(' / ')} · {recipe.cookTime} 分钟
        </div>

        <h3 className="mt-4 font-medium">食材</h3>
        <ul className="list-disc pl-5 mt-2 text-sm">
          {recipe.ingredients.map((ing, idx) => (
            <li key={idx}>
              {ing.name} {ing.quantity ? `· ${ing.quantity}` : ''} {ing.category ? `（${ing.category}）` : ''}
            </li>
          ))}
        </ul>

        <h3 className="mt-4 font-medium">步骤</h3>
        <ol className="list-decimal pl-5 mt-2 text-sm space-y-1">
          {recipe.steps.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>

        {recipe.tips && recipe.tips.length ? (
          <>
            <h3 className="mt-4 font-medium">建议</h3>
            <ul className="list-disc pl-5 mt-2 text-sm">
              {recipe.tips.map((t, idx) => <li key={idx}>{t}</li>)}
            </ul>
          </>
        ) : null}

        {recipe.nutrition ? (
          <div className="mt-4 text-xs text-gray-600">
            营养：{recipe.nutrition.kcal ?? '-'} kcal · 蛋白质 {recipe.nutrition.proteinG ?? '-'} g · 碳水 {recipe.nutrition.carbG ?? '-'} g · 脂肪 {recipe.nutrition.fatG ?? '-'} g
          </div>
        ) : null}
      </div>
    </div>
  );
}


