import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContentBlock } from "@/types/content";

interface ContentEditorState {
	contentBlocks: ContentBlock[];
	activeBlock: string | null;
	title: string;
	isEditing: boolean;
}

const initialState: ContentEditorState = {
	contentBlocks: [],
	activeBlock: null,
	title: "Untitled Content",
	isEditing: false,
};

const contentEditorSlice = createSlice({
	name: "contentEditor",
	initialState,
	reducers: {
		// Initialize content with template
		initializeContent: (
			state,
			action: PayloadAction<{ blocks: ContentBlock[] }>
		) => {
			state.contentBlocks = action.payload.blocks;
			state.activeBlock =
				action.payload.blocks.length > 0
					? action.payload.blocks[0].id
					: null;
			state.isEditing = true;
		},

		// Set title
		setTitle: (state, action: PayloadAction<string>) => {
			state.title = action.payload;
		},

		// Add new block
		addBlock: (
			state,
			action: PayloadAction<{
				type: ContentBlock["type"];
				index?: number;
			}>
		) => {
			const { type, index } = action.payload;

			const newBlock: ContentBlock = {
				id: Math.random().toString(36).substr(2, 9),
				type,
				content:
					type === "text"
						? "New text content..."
						: type === "heading"
						? "New heading..."
						: type === "text-image"
						? ""
						: "",
				alignment: "left",
				...(type === "columns" && {
					children: [
						{
							id: Math.random().toString(36).substr(2, 9),
							type: "text",
							content: "Column 1 content...",
							alignment: "left",
						},
						{
							id: Math.random().toString(36).substr(2, 9),
							type: "text",
							content: "Column 2 content...",
							alignment: "left",
						},
					],
				}),
				...(type === "text-image" && {
					imagePosition: "left",
					imageUrl: "",
				}),
			};

			if (index !== undefined) {
				state.contentBlocks.splice(index + 1, 0, newBlock);
			} else {
				state.contentBlocks.push(newBlock);
			}
			state.activeBlock = newBlock.id;
		},

		// Update block content
		updateBlock: (
			state,
			action: PayloadAction<{
				blockId: string;
				updates: Partial<ContentBlock>;
			}>
		) => {
			const { blockId, updates } = action.payload;
			const blockIndex = state.contentBlocks.findIndex(
				(block) => block.id === blockId
			);

			if (blockIndex !== -1) {
				state.contentBlocks[blockIndex] = {
					...state.contentBlocks[blockIndex],
					...updates,
				};
			}
		},

		// Delete block
		deleteBlock: (state, action: PayloadAction<string>) => {
			const blockId = action.payload;
			state.contentBlocks = state.contentBlocks.filter(
				(block) => block.id !== blockId
			);

			if (state.activeBlock === blockId) {
				state.activeBlock =
					state.contentBlocks.length > 0
						? state.contentBlocks[0].id
						: null;
			}
		},

		// Set active block
		setActiveBlock: (state, action: PayloadAction<string | null>) => {
			state.activeBlock = action.payload;
		},

		// Update column content
		updateColumnContent: (
			state,
			action: PayloadAction<{
				columnId: string;
				content: string;
			}>
		) => {
			const { columnId, content } = action.payload;

			state.contentBlocks = state.contentBlocks.map((block) => {
				if (block.type === "columns" && block.children) {
					return {
						...block,
						children: block.children.map((child) =>
							child.id === columnId
								? { ...child, content }
								: child
						),
					};
				}
				return block;
			});
		},

		// Add column to columns block
		addColumn: (state, action: PayloadAction<string>) => {
			const blockId = action.payload;

			state.contentBlocks = state.contentBlocks.map((block) => {
				if (block.id === blockId && block.type === "columns") {
					const newColumn: ContentBlock = {
						id: Math.random().toString(36).substr(2, 9),
						type: "text",
						content: "New column content...",
						alignment: "left",
					};
					return {
						...block,
						children: [...(block.children || []), newColumn],
					};
				}
				return block;
			});
		},

		// Delete column from columns block
		deleteColumn: (
			state,
			action: PayloadAction<{
				blockId: string;
				columnId: string;
			}>
		) => {
			const { blockId, columnId } = action.payload;

			state.contentBlocks = state.contentBlocks.map((block) => {
				if (
					block.id === blockId &&
					block.type === "columns" &&
					block.children
				) {
					const newChildren = block.children.filter(
						(child) => child.id !== columnId
					);
					return {
						...block,
						children: newChildren,
					};
				}
				return block;
			});
		},

		// Reorder blocks
		reorderBlocks: (
			state,
			action: PayloadAction<{
				fromIndex: number;
				toIndex: number;
			}>
		) => {
			const { fromIndex, toIndex } = action.payload;
			const [movedBlock] = state.contentBlocks.splice(fromIndex, 1);
			state.contentBlocks.splice(toIndex, 0, movedBlock);
		},

		// Upload image to block
		uploadImageToBlock: (
			state,
			action: PayloadAction<{
				blockId: string;
				imageUrl: string;
			}>
		) => {
			const { blockId, imageUrl } = action.payload;
			const blockIndex = state.contentBlocks.findIndex(
				(block) => block.id === blockId
			);

			if (blockIndex !== -1) {
				state.contentBlocks[blockIndex].imageUrl = imageUrl;
			}
		},

		// Remove image from block
		removeImageFromBlock: (state, action: PayloadAction<string>) => {
			const blockId = action.payload;
			const blockIndex = state.contentBlocks.findIndex(
				(block) => block.id === blockId
			);

			if (blockIndex !== -1) {
				state.contentBlocks[blockIndex].imageUrl = "";
			}
		},

		// Reset editor
		resetEditor: (state) => {
			state.contentBlocks = [];
			state.activeBlock = null;
			state.title = "Untitled Content";
			state.isEditing = false;
		},

		// Load saved content
		loadContent: (
			state,
			action: PayloadAction<{
				title: string;
				blocks: ContentBlock[];
			}>
		) => {
			state.title = action.payload.title;
			state.contentBlocks = action.payload.blocks;
			state.activeBlock =
				action.payload.blocks.length > 0
					? action.payload.blocks[0].id
					: null;
			state.isEditing = true;
		},

		// Duplicate block
		duplicateBlock: (state, action: PayloadAction<string>) => {
			const blockId = action.payload;
			const blockIndex = state.contentBlocks.findIndex(
				(block) => block.id === blockId
			);

			if (blockIndex !== -1) {
				const originalBlock = state.contentBlocks[blockIndex];
				const duplicatedBlock: ContentBlock = {
					...originalBlock,
					id: Math.random().toString(36).substr(2, 9),
					...(originalBlock.children && {
						children: originalBlock.children.map((child) => ({
							...child,
							id: Math.random().toString(36).substr(2, 9),
						})),
					}),
				};

				state.contentBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
				state.activeBlock = duplicatedBlock.id;
			}
		},
	},
});

export const {
	initializeContent,
	setTitle,
	addBlock,
	updateBlock,
	deleteBlock,
	setActiveBlock,
	updateColumnContent,
	addColumn,
	deleteColumn,
	reorderBlocks,
	uploadImageToBlock,
	removeImageFromBlock,
	resetEditor,
	loadContent,
	duplicateBlock,
} = contentEditorSlice.actions;

export default contentEditorSlice.reducer;
