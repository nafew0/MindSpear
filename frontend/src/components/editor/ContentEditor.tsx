// components/editor/ContentEditor.tsx
"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ContentBlockComponent } from "./ContentBlock";
// import StylableInput from "@/lib/StylableInput";
import {
	addBlock,
	setActiveBlock,
	updateBlock,
	deleteBlock,
	updateColumnContent,
	addColumn,
	deleteColumn,
	uploadImageToBlock,
	removeImageFromBlock,
} from "@/stores/features/contentEditorSlice";
import { RootState } from "@/stores/store";
import { ContentBlock } from "@/types/content";

export function ContentEditor() {
	const dispatch = useDispatch();
	const { contentBlocks, activeBlock } = useSelector(
		(state: RootState) => state.contentEditor
	);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleAddBlock = (type: 'text' | 'image' | 'columns' | 'heading', index?: number) => {
		dispatch(addBlock({ type, index }));
	};

	const handleUpdateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
		dispatch(updateBlock({ blockId, updates }));
	};

	const handleDeleteBlock = (blockId: string) => {
		dispatch(deleteBlock(blockId));
	};

	const handleImageUpload = (blockId: string, file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			dispatch(uploadImageToBlock({
				blockId,
				imageUrl: e.target?.result as string
			}));
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveImage = (blockId: string) => {
		dispatch(removeImageFromBlock(blockId));
	};

	const handleUpdateColumn = (columnId: string, content: string) => {
		dispatch(updateColumnContent({ columnId, content }));
	};

	const handleAddColumn = (blockId: string) => {
		dispatch(addColumn(blockId));
	};

	const handleDeleteColumn = (blockId: string, columnId: string) => {
		dispatch(deleteColumn({ blockId, columnId }));
	};


	if (!mounted) {
		return (
			<div className="bg-white dark:bg-slate-900 py-8 px-4">
				<div className="max-w-4xl mx-auto">
					<div className="animate-pulse">
						<div className="h-12 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
						<div className="space-y-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full!">
			<div className="w-full mx-auto">
				{/* Floating Add Button */}
				<div className="fixed bottom-8 right-8 z-10">
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => handleAddBlock('text')}
						className="p-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all"
					>
						<Plus className="h-6 w-6" />
					</motion.button>
				</div>

				{/* Content Blocks */}
				<div className="space-y-6">
					{contentBlocks.map((block, index) => (
						<ContentBlockComponent
							key={block.id}
							block={block}
							index={index}
							isActive={activeBlock === block.id}
							totalBlocks={contentBlocks.length}
							onActivate={() => dispatch(setActiveBlock(block.id))}
							onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
							onImageUpload={(file) => handleImageUpload(block.id, file)}
							onRemoveImage={() => handleRemoveImage(block.id)}
							onUpdateColumn={handleUpdateColumn}
							onAddColumn={() => handleAddColumn(block.id)}
							onDeleteColumn={(columnId) => handleDeleteColumn(block.id, columnId)}
							onAddBlock={handleAddBlock}
							onDeleteBlock={() => handleDeleteBlock(block.id)}
						/>
					))}
				</div>

				{/* Empty State */}
				{contentBlocks.length === 0 && (
					<div className="text-center py-20 relative">
						<div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8">
							<input
								type="text"
								placeholder="Type / to add blocks, text, headings, code, quotes, etc..."
								className="w-full bg-transparent border-none outline-none text-slate-500 dark:text-slate-400 text-center text-lg"
								onKeyDown={(e) => {
									if (e.key === '/') {
										e.preventDefault();
										handleAddBlock('text');
									}
								}}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}