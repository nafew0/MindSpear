// components/editor/ContentBlock.tsx
"use client";

import { cn } from "@/lib/utils";
import { ContentBlock } from "@/types/content";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ColumnsBlock } from "./ColumnsBlock";
import { HeadingBlock } from "./HeadingBlock";
import { TextImageBlock } from "./TextImageBlock"; // Add this import
import { BlockControls } from "./BlockControls";

interface ContentBlockProps {
	block: ContentBlock;
	index: number;
	isActive: boolean;
	totalBlocks: number;
	onActivate: () => void;
	onUpdate: (updates: Partial<ContentBlock>) => void;
	onImageUpload: (file: File) => void;
	onRemoveImage: () => void;
	onUpdateColumn: (columnId: string, content: string) => void;
	onAddColumn: () => void;
	onDeleteColumn: (columnId: string) => void;
	onAddBlock: (type: 'text' | 'image' | 'columns' | 'heading', index?: number) => void;
	onDeleteBlock: () => void;
}

export function ContentBlockComponent({
	block,
	index,
	isActive,
	onActivate,
	onUpdate,
	onImageUpload,
	onRemoveImage,
	onUpdateColumn,
	onAddColumn,
	onDeleteColumn,
	onAddBlock,
	onDeleteBlock,
}: ContentBlockProps) {
	return (
		<div
			className={cn(
				"relative group border-2 rounded-lg p-4 transition-all cursor-pointer",
				isActive
					? "border-primary bg-primary/5"
					: "border-transparent hover:border-slate-300"
			)}
			onClick={onActivate}
		>
			<BlockControls
				onAddText={() => onAddBlock('text', index)}
				onAddImage={() => onAddBlock('image', index)}
				onAddColumns={() => onAddBlock('columns', index)}
				onAddHeading={() => onAddBlock('heading', index)}
				onDelete={onDeleteBlock}
				showDelete={true}
			/>

			<div className="w-full">
				<div>
					{block.type === 'text' && (
						<TextBlock
							block={block}
							isActive={isActive}
							onUpdate={onUpdate}
						/>
					)}
				</div>

				{block.type === 'heading' && (
					<HeadingBlock
						block={block}
						isActive={isActive}
						onUpdate={onUpdate}
					/>
				)}

				{block.type === 'image' && (
					<ImageBlock
						block={block}
						isActive={isActive}
						onUpdate={onUpdate}
						onImageUpload={onImageUpload}
						onRemoveImage={onRemoveImage}
					/>
				)}

				{/* ADD THIS SECTION FOR TEXT-IMAGE BLOCKS */}
				{block.type === 'text-image' && (
					<TextImageBlock
						block={block}
						isActive={isActive}
						onUpdate={onUpdate}
						onImageUpload={onImageUpload}
						onRemoveImage={onRemoveImage}
					/>
				)}

				{block.type === 'columns' && (
					<ColumnsBlock
						block={block}
						isActive={isActive}
						onUpdateColumn={onUpdateColumn}
						onAddColumn={onAddColumn}
						onDeleteColumn={onDeleteColumn}
					/>
				)}
			</div>
		</div>
	);
}