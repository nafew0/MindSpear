/* eslint-disable @typescript-eslint/no-unused-vars */
// components/editor/HeadingBlock.tsx
"use client";

import { JSX, useState } from "react";
import { cn } from "@/lib/utils";
import { ContentBlock } from "@/types/content";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface HeadingBlockProps {
	block: ContentBlock;
	isActive: boolean;
	onUpdate: (updates: Partial<ContentBlock>) => void;
}

export function HeadingBlock({ block, isActive, onUpdate }: HeadingBlockProps) {
	const [headingLevel, setHeadingLevel] = useState<1 | 2 | 3>(1);

	const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
		onUpdate({ alignment });
	};

	const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;

	return (
		<div className="w-full">
			{isActive && (
				<div className="flex items-center gap-2 mb-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
					<select
						value={headingLevel}
						onChange={(e) => setHeadingLevel(parseInt(e.target.value) as 1 | 2 | 3)}
						className="p-1 border rounded bg-white dark:bg-slate-600"
					>
						<option value={1}>Heading 1</option>
						<option value={2}>Heading 2</option>
						<option value={3}>Heading 3</option>
					</select>

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
					"w-full p-4 border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:outline-none bg-transparent text-slate-700 dark:text-slate-200 font-bold",
					block.alignment === 'center' && 'text-center',
					block.alignment === 'right' && 'text-right',
					headingLevel === 1 && "text-3xl",
					headingLevel === 2 && "text-2xl",
					headingLevel === 3 && "text-xl"
				)}
				placeholder="Heading..."
				style={{
					fontSize: headingLevel === 1 ? '1.875rem' : headingLevel === 2 ? '1.5rem' : '1.25rem',
					fontWeight: 'bold'
				}}
			/>
		</div>
	);
}