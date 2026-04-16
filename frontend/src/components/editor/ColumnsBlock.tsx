/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ContentBlock } from "@/types/content";
import { Plus, X, Bold, Italic, List, Link, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ColumnsBlockProps {
	block: ContentBlock;
	isActive: boolean;
	onUpdateColumn: (columnId: string, content: string) => void;
	onAddColumn: () => void;
	onDeleteColumn: (columnId: string) => void;
}

export function ColumnsBlock({ block, isActive, onUpdateColumn, onAddColumn, onDeleteColumn }: ColumnsBlockProps) {
	if (!block.children) return null;

	return (
		<div className="space-y-4">
			<div
				className="grid gap-4"
				style={{ gridTemplateColumns: `repeat(${block.children.length}, 1fr)` }}
			>
				{block.children.map((column, columnIndex) => (
					<ColumnItem
						key={column.id}
						column={column}
						isActive={isActive}
						onUpdateColumn={onUpdateColumn}
						onDeleteColumn={onDeleteColumn}
                        canDelete={!!(block.children && block.children.length > 1)} 
					/>
				))}
			</div>
			{isActive && (
				<button
					onClick={onAddColumn}
					className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
				>
					<Plus className="h-3 w-3" />
					Add Column
				</button>
			)}
		</div>
	);
}

interface ColumnItemProps {
	column: ContentBlock;
	isActive: boolean;
	onUpdateColumn: (columnId: string, content: string) => void;
	onDeleteColumn: (columnId: string) => void;
	canDelete: boolean;
}

function ColumnItem({ column, isActive, onUpdateColumn, onDeleteColumn, canDelete }: ColumnItemProps) {
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);

	const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
		// If you want to store alignment per column, you'd need to update the column block
		// For now, we'll just apply it visually
	};

	return (
		<div className="relative border border-slate-200 dark:border-slate-600 rounded-lg p-4">
			{isActive && canDelete && (
				<button
					onClick={() => onDeleteColumn(column.id)}
					className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
				>
					<X className="h-3 w-3" />
				</button>
			)}

			{isActive && (
				<div className="flex items-center gap-1 mb-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
					<button
						onClick={() => setIsBold(!isBold)}
						className={cn("p-1 rounded", isBold && "bg-white dark:bg-slate-600")}
					>
						<Bold className="h-4 w-4" />
					</button>
					<button
						onClick={() => setIsItalic(!isItalic)}
						className={cn("p-1 rounded", isItalic && "bg-white dark:bg-slate-600")}
					>
						<Italic className="h-4 w-4" />
					</button>
					<button className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded">
						<List className="h-4 w-4" />
					</button>
					<button className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded">
						<Link className="h-4 w-4" />
					</button>
					<div className="flex items-center gap-1 ml-2">
						<button
							onClick={() => handleAlignmentChange('left')}
							className={cn("p-1 rounded", column.alignment === 'left' && 'bg-white dark:bg-slate-600')}
						>
							<AlignLeft className="h-4 w-4" />
						</button>
						<button
							onClick={() => handleAlignmentChange('center')}
							className={cn("p-1 rounded", column.alignment === 'center' && 'bg-white dark:bg-slate-600')}
						>
							<AlignCenter className="h-4 w-4" />
						</button>
						<button
							onClick={() => handleAlignmentChange('right')}
							className={cn("p-1 rounded", column.alignment === 'right' && 'bg-white dark:bg-slate-600')}
						>
							<AlignRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			<textarea
				value={column.content}
				onChange={(e) => onUpdateColumn(column.id, e.target.value)}
				className={cn(
					"w-full min-h-[100px] p-2 border border-slate-200 dark:border-slate-600 rounded resize-none focus:outline-none bg-transparent text-slate-700 dark:text-slate-200",
					column.alignment === 'center' && 'text-center',
					column.alignment === 'right' && 'text-right',
					isBold && "font-bold",
					isItalic && "italic"
				)}
				placeholder="Column content..."
			/>
		</div>
	);
}