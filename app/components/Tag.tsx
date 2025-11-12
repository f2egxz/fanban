'use client';
import React from 'react';

type TagProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
};

export default function Tag({ label, selected, onClick, icon, className }: TagProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full border text-sm mr-2 mb-2 ${
        selected ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'
      } ${className ?? ''}`}
    >
      {icon ? <span className="mr-1">{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}


