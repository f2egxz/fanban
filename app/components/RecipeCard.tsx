'use client';
import React from 'react';
import Link from 'next/link';
import { recipeById } from '../lib/generator';

type Props = {
  recipeId: string;
  onSwap?: () => void;
};

export default function RecipeCard({ recipeId, onSwap }: Props) {
  const recipe = recipeById(recipeId);
  if (!recipe) return null;
  return (
    <div className="border rounded-lg p-3 mb-3 flex">
      <img
        src={recipe.image}
        alt={recipe.name}
        className="w-20 h-20 rounded object-cover mr-3 bg-gray-100"
      />
      <div className="flex-1">
        <Link href={`/recipe/${recipe.id}`} className="font-medium">
          {recipe.name}
        </Link>
        <div className="text-xs text-gray-500 mt-1">
          {recipe.styles.slice(0, 2).join(' / ')} · {recipe.cookTime} 分钟
        </div>
        <div className="mt-2">
          {onSwap ? (
            <button
              onClick={onSwap}
              className="text-xs px-2 py-1 border rounded-full"
            >
              换菜
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}


