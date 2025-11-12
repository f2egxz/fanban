'use client';
import React from 'react';
import Tag from './Tag';

type Option = { label: string; value: string };

type PreferenceGroupProps = {
  title: string;
  options: Option[];
  value: string[] | string;
  multiple?: boolean;
  onChange: (value: string[] | string) => void;
};

export default function PreferenceGroup({
  title,
  options,
  value,
  multiple,
  onChange,
}: PreferenceGroupProps) {
  const isSelected = (val: string) =>
    Array.isArray(value) ? value.includes(val) : value === val;

  const handleClick = (val: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value.slice() : [];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(val);
      onChange(arr);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="flex flex-wrap">
        {options.map(opt => (
          <Tag
            key={opt.value}
            label={opt.label}
            selected={isSelected(opt.value)}
            onClick={() => handleClick(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}


