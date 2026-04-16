/* eslint-disable @typescript-eslint/no-explicit-any */
// app/content-type/page.tsx
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ContentBlock } from "@/types/content";
import { TemplateSelector } from "@/components/editor/TemplateSelector";
import { ContentEditor } from "@/components/editor/ContentEditor";
import {
	initializeContent,
	resetEditor,
} from "@/stores/features/contentEditorSlice";
import { RootState } from "@/stores/store";
import React from "react";

const ContentType: React.FC<{ id: string }> = ({ id }) => {
	console.log(id, "999999999999999999999999999");

	const dispatch = useDispatch();
	const { contentBlocks, isEditing } = useSelector(
		(state: RootState) => state.contentEditor
	);

	const selectedItem = useSelector(
		(state: RootState) => state.quiz.selectedItem
	);

	console.log(selectedItem, "selectedItem?.layout_id");

	const createInitialContent = (templateId: number) => {
		let newBlocks: ContentBlock[] = [];
		const layoutNumber = selectedItem?.layout_id
			? selectedItem?.layout_id
			: templateId;
		// console.log(
		// 	selectedItem,
		// 	"selectedItemselectedItemselectedItemselectedItemselectedItem"
		// );
		switch (Number(layoutNumber)) {
			case 2: // Image and text (image left, text right)
				newBlocks = [
					{
						id: Math.random().toString(36).substr(2, 9),
						type: "text-image",
						content: "",
						alignment: "left",
						imageUrl: "",
						imagePosition: "left",
					},
				];
				break;
			case 3: // Text and image (text left, image right)
				newBlocks = [
					{
						id: Math.random().toString(36).substr(2, 9),
						type: "text-image",
						content: "",
						alignment: "left",
						imageUrl: "",
						imagePosition: "right",
					},
				];
				break;
			case 4: // Two columns
				newBlocks = [
					{
						id: Math.random().toString(36).substr(2, 9),
						type: "columns",
						content: "",
						alignment: "left",
						children: [
							{
								id: Math.random().toString(36).substr(2, 9),
								type: "text",
								content: "Left column content...",
								alignment: "left",
							},
							{
								id: Math.random().toString(36).substr(2, 9),
								type: "text",
								content: "Right column content...",
								alignment: "left",
							},
						],
					},
				];
				break;
			case 8: // Three columns
				newBlocks = [
					{
						id: Math.random().toString(36).substr(2, 9),
						type: "columns",
						content: "",
						alignment: "left",
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
							{
								id: Math.random().toString(36).substr(2, 9),
								type: "text",
								content: "Column 3 content...",
								alignment: "left",
							},
						],
					},
				];
				break;
			case 11: // Image gallery
				newBlocks = [
					{
						id: Math.random().toString(36).substr(2, 9),
						type: "image",
						content: "",
						alignment: "center",
						imageUrl: "",
					},
				];
				break;
			default: // Simple text
				newBlocks = [
					{
						id: Math.random().toString(36).substr(2, 9),
						type: "text",
						content: "Start typing your content...",
						alignment: "left",
					},
				];
		}

		dispatch(initializeContent({ blocks: newBlocks }));
	};

	// Reset editor when component unmounts
	useEffect(() => {
		return () => {
			dispatch(resetEditor());
		};
	}, [dispatch]);

	if (!isEditing || contentBlocks.length === 0) {
		return (
			<TemplateSelector id={id} onTemplateSelect={createInitialContent} />
		);
	}

	return <ContentEditor />;
};
export default React.memo(ContentType);
