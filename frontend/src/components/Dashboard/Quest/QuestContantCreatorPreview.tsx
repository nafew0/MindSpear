/* eslint-disable @typescript-eslint/no-explicit-any */
// QuestQuickFormCreatorPreview.tsx
"use client";
import React, { useMemo, useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { useParams } from "next/navigation";
import StylableInput from "@/lib/StylableInput";
import axiosInstance from "@/utils/axiosInstance";
import ConfirmDialog from "@/utils/showConfirmDialog";
import { mainTemplates, allTemplateCategories } from "@/constants/templates";
import { Select } from "@/components/FormElements/select";
import { selectTaskById } from "@/stores/features/selectors";
import { FaRegClock } from "react-icons/fa6";
import { motion } from "framer-motion";
import {
	updateLimitedTimeTitle,
	contantData,
} from "@/stores/features/quizItems/quizSlice";
import { Trash2 } from "lucide-react";
import { TemplateCard } from "@/components/editor/TemplateCard";
import GlobalModal from "@/components/globalModal";
import { ContentEditor } from "@/components/editor/ContentEditor";
// import { ContentBlockComponent } from "@/components/editor/ContentBlock";

import {
	initializeContent,
	// resetEditor,
} from "@/stores/features/contentEditorSlice";
// import { TemplateSelector } from "@/components/editor/TemplateSelector";

// import { Upload } from "antd";

const QuestContantCreatorPreview: React.FC<{ id: string }> = ({ id }) => {
	const dispatch = useDispatch();
	const params = useParams();
	const questId = String(params?.id ?? "");
	const { selectedItem, multypleselectedItem } = useSelector(
		(s: any) => s.quiz
	);
	const currentItem: any = multypleselectedItem.find(
		(item: { id: string }) => item.id === id
	);
	console.log(currentItem, "333333333333");
	console.log(selectedItem, "333333333333");

	// Ensure quest + the "server task" based on selectedItem.id
	const serverTaskId = useMemo(
		() => (selectedItem?.id ? Number(selectedItem.id) : undefined),
		[selectedItem?.id]
	);
	const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);
	// Pull current task + questions from slice
	const task = useSelector((s: RootState) =>
		serverTaskId ? selectTaskById(s, questId, serverTaskId) : null
	);
	console.log(task, "tasktasktasktask");

	const [preview, setPreview] = useState<string | null>(null);
	const [fileData, setFileData] = useState<any>(null);
	// const [bgUrl, setBgUrl] = useState<string>("");

	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	console.log(error, progress, uploading, preview);
	const [templateModalOpen, setTemplateModalOpen] = useState(false);

	const confirmDeleteFromServer = useCallback(async () => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this question?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				const response = await axiosInstance.delete(
					`/quest-tasks/delete/${currentItem?.id}`
				);
				console.log(response);
			}
		);
	}, [currentItem]);

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);
		const file = e.target.files?.[0];
		if (!file) return;

		// Optional: show preview
		const url = URL.createObjectURL(file);
		setPreview(url);

		// Build form data as you described
		const formData = new FormData();
		formData.append("file", file);
		formData.append("name", file.name);

		try {
			setUploading(true);
			setProgress(0);

			const res = await axiosInstance.post("/files/store", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (evt) => {
					if (!evt.total) return;
					const pct = Math.round((evt.loaded * 100) / evt.total);
					setProgress(pct);
				},
			});
			const fileObj = res.data?.data?.file;
			setFileData(fileObj);
			dispatch(
				contantData({
					id,
					image_url: fileObj,
				})
			);

			// //console.log("Uploaded:", res.data);
		} catch (err: any) {
			setError(err?.response?.data?.message || "Upload failed");
		} finally {
			setUploading(false);
			// If you want to allow selecting the same file again:
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	console.log(fileData);

	const createInitialContent = (templateId: number) => {
		let newBlocks: any = [];
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

	const handleTemplateClick = (lid: number) => {
		console.log(lid, "lskjdlasjd");

		if (lid !== 6) {
			createInitialContent(lid);
			dispatch(
				contantData({
					id,
					layout_id: `${lid}`,
				})
			);
		} else {
			// onTemplateSelect(lid);
			console.log(selectedItem, "33333");

			setTemplateModalOpen(true);
		}
	};

	const handleAllTemplateClick = (lid: number) => {
		setTemplateModalOpen(false);
		createInitialContent(lid);
		dispatch(
			contantData({
				id,
				layout_id: `${lid}`,
			})
		);
		console.log(id);

		// onTemplateSelect(id);
	};

	console.log(selectedItem, "44444444444444");

	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
			{/* Left */}
			<div className="md:col-span-9">
				{/* selectedItem?.layout_id */}
				<div
					className={`flex-1 p-4 bg-white border-2  rounded-md h-[calc(90vh-80px)] flex flex-col overflow-y-auto scrollbar-hidden ${
						selectedItem?.layout_id ? "" : "border-[#bc5eb3]"
					}`}
				>
					<StylableInput style="quest" />
					<div className="space-y-8 mt-6">
						<div
							className="bg-center bg-cover"
							// style={{
							// 	// Use API path if present; fallback to your example URL
							// 	backgroundImage: `url("${fileData?.path}")`,
							// }}
							// style={{
							// 	backgroundImage: `url("${selectedItem?.image_url?.path}")`,
							// 	height: "350px",
							// }}
						>
							{/* <h3
								className={`flex justify-center  pt-3  font-bold  p-5 ${
									selectedItem?.image_url?.path
										? "text-white"
										: "text-black"
								}`}
							>
								{selectedItem?.contant_title || ""}
								{selectedItem?.layout_id || ""}
							</h3> */}
							{selectedItem?.layout_id && <ContentEditor />}
						</div>
					</div>
				</div>
			</div>

			{/* Right */}
			<div className="md:col-span-3 p-6 bg-white rounded-md h-[calc(90vh-80px)] overflow-y-auto scrollbar-hidden">
				<div className="flex gap-3 mb-6">
					<button
						onClick={confirmDeleteFromServer}
						className="bg-[#f2f1f0] hover:bg-red-500 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 w-full py-2 rounded-md font-medium"
					>
						<Trash2 size={16} /> <span>Delete</span>
					</button>
				</div>

				<div className="">
					{mainTemplates.map((template) => (
						<div className="pb-[20px]" key={template.id}>
							<TemplateCard
								template={template}
								selected={false}
								hovered={hoveredTemplate === template.id}
								onHover={setHoveredTemplate}
								onClick={handleTemplateClick}
							/>
						</div>
					))}

					<textarea
						placeholder="write your contant title ..."
						className=" w-full min-h-[20px] hidden p-3  border text-xl rounded-lg mb-2 focus:outline-none"
						value={`${selectedItem?.contant_title || ""}`}
						onChange={(value) => {
							console.log(value?.target?.value, "99999999999");
							dispatch(
								contantData({
									id,
									contant_title: value?.target?.value,
								})
							);
						}}
					/>
				</div>
				<label className="hidden items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
					{/* <Upload className="h-8 w-8 text-primary mb-2" /> */}
					<span className="text-sm text-slate-500 dark:text-slate-400">
						Click to upload image
					</span>
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleChange}
					/>
				</label>

				<Select
					className="mt-4 text-sm"
					label="Time Limit"
					items={[
						{ label: "5 Seconds", value: "5" },
						{ label: "10 Seconds", value: "10" },
						{ label: "20 Seconds", value: "20" },
						{ label: "30 Seconds", value: "30" },
						{ label: "45 Seconds", value: "45" },
						{ label: "60 Seconds", value: "60" },
						{ label: "1 Min 30 Sec ", value: "90" },
						{ label: "2 Minute  ", value: "120" },
						{ label: "2 Minute 30 Sec ", value: "150" },
						{ label: "3 Minute ", value: "180" },
					]}
					value={`${selectedItem?.timeLimit || "30"}`}
					prefixIcon={<FaRegClock />}
					onChange={(value) =>
						dispatch(
							updateLimitedTimeTitle({ id, timeLimit: value })
						)
					}
				/>
			</div>

			<GlobalModal
				title="Choose a Template"
				open={templateModalOpen}
				onClose={() => setTemplateModalOpen(false)}
			>
				<div className="p-6 max-h-[70vh] overflow-y-auto">
					<div className="space-y-8">
						{allTemplateCategories.map(
							(category, categoryIndex) => (
								<motion.div
									key={category.name}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: categoryIndex * 0.1 }}
								>
									<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
										{category.name}
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										{category.templates.map((template) => (
											<TemplateCard
												key={template.id}
												template={template}
												selected={false}
												hovered={
													hoveredTemplate ===
													template.id
												}
												onHover={setHoveredTemplate}
												onClick={handleAllTemplateClick}
											/>
										))}
									</div>
								</motion.div>
							)
						)}
					</div>
				</div>
			</GlobalModal>
		</div>
	);
};

export default React.memo(QuestContantCreatorPreview);
