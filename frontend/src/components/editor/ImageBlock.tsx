"use client";

import { cn } from "@/lib/utils";
import { ContentBlock } from "@/types/content";
import {
	Upload,
	X,
	AlignLeft,
	AlignCenter,
	AlignRight,
} from "lucide-react";

interface ImageBlockProps {
	block: ContentBlock;
	isActive: boolean;
	onUpdate: (updates: Partial<ContentBlock>) => void;
	onImageUpload: (file: File) => void;
	onRemoveImage: () => void;
}

export function ImageBlock({ block, isActive, onUpdate, onImageUpload, onRemoveImage }: ImageBlockProps) {
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			onImageUpload(file);
		}
	};

	const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
		onUpdate({ alignment });
	};

	return (
		<div className="flex flex-col items-center ">
			{block.imageUrl ? (
				<div className="relative">
					<img
						src={block.imageUrl}
						alt="Content"
						className="max-w-full max-h-72 object-contain rounded-lg"
					/>
					{isActive && (
						<button
							onClick={onRemoveImage}
							className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
			) : (
				<label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
					<Upload className="h-8 w-8 text-slate-400 mb-2" />
					<span className="text-sm text-slate-500 dark:text-slate-400">Click to upload image</span>
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="hidden"
					/>
				</label>
			)}
			{isActive && (
				<div className="flex items-center gap-2 mt-2">
					<button
						onClick={() => handleAlignmentChange('left')}
						className={cn("p-2 rounded", block.alignment === 'left' && 'bg-slate-200 dark:bg-slate-600')}
					>
						<AlignLeft className="h-4 w-4" />
					</button>
					<button
						onClick={() => handleAlignmentChange('center')}
						className={cn("p-2 rounded", block.alignment === 'center' && 'bg-slate-200 dark:bg-slate-600')}
					>
						<AlignCenter className="h-4 w-4" />
					</button>
					<button
						onClick={() => handleAlignmentChange('right')}
						className={cn("p-2 rounded", block.alignment === 'right' && 'bg-slate-200 dark:bg-slate-600')}
					>
						<AlignRight className="h-4 w-4" />
					</button>
				</div>
			)}
		</div>
	);
}