// components/editor/TextBlock.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ContentBlock } from "@/types/content";
import {
	Bold,
	Italic,
	List,
	Link,
	AlignLeft,
	AlignCenter,
	AlignRight,
} from "lucide-react";

interface TextBlockProps {
	block: ContentBlock;
	isActive: boolean;
	onUpdate: (updates: Partial<ContentBlock>) => void;
}

export function TextBlock({ block, isActive, onUpdate }: TextBlockProps) {
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);

	const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
		onUpdate({ alignment });
	};

	return (
		<div className="w-full">
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
							className={cn("p-1 rounded", block.alignment === 'left' && 'bg-white dark:bg-slate-600')}
						>
							<AlignLeft className="h-4 w-4" />
						</button>
						<button
							onClick={() => handleAlignmentChange('center')}
							className={cn("p-1 rounded", block.alignment === 'center' && 'bg-white dark:bg-slate-600')}
						>
							<AlignCenter className="h-4 w-4" />
						</button>
						<button
							onClick={() => handleAlignmentChange('right')}
							className={cn("p-1 rounded", block.alignment === 'right' && 'bg-white dark:bg-slate-600')}
						>
							<AlignRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			<textarea
				value={block.content}
				onChange={(e) => onUpdate({ content: e.target.value })}
				className={cn(
					"w-full min-h-[100px] p-4 border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:outline-none bg-transparent text-slate-700 dark:text-slate-200",
					block.alignment === 'center' && 'text-center',
					block.alignment === 'right' && 'text-right',
					isBold && "font-bold",
					isItalic && "italic"
				)}
				placeholder="Start typing..."
			/>
		</div>
	);
}