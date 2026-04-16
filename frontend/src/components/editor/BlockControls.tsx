// components/editor/BlockControls.tsx
"use client";

import {
  Type,
  ImageIcon,
  Columns,
  Heading,
  Trash2,
} from "lucide-react";

interface BlockControlsProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddColumns: () => void;
  onAddHeading: () => void;
  onDelete: () => void;
  showDelete: boolean;
}

export function BlockControls({ 
  onAddText, 
  onAddImage, 
  onAddColumns, 
  onAddHeading, 
  onDelete, 
  showDelete 
}: BlockControlsProps) {
  return (
    <div className="absolute -top-3 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button
        onClick={onAddText}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        title="Add Text"
      >
        <Type className="h-3 w-3" />
      </button>
      <button
        onClick={onAddHeading}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        title="Add Heading"
      >
        <Heading className="h-3 w-3" />
      </button>
      <button
        onClick={onAddImage}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        title="Add Image"
      >
        <ImageIcon className="h-3 w-3" />
      </button>
      <button
        onClick={onAddColumns}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        title="Add Columns"
      >
        <Columns className="h-3 w-3" />
      </button>
      {showDelete && (
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500"
          title="Delete Block"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}