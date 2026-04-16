/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import Image from "next/image";

interface StylableInputFileProps {
	onImageUpload?: (file: File) => Promise<{ path: string; id: number }>;
	onImageRemove?: () => Promise<void>;
	initialImageUrl?: string | null;
	initialImageId?: number | null;
}

export default function StylableInputFile({
	onImageUpload,
	onImageRemove,
	initialImageUrl,
	initialImageId,
}: StylableInputFileProps) {
	const [image, setImage] = useState<string | null>(initialImageUrl || null);
	const [imageId, setImageId] = useState<number | null>(
		initialImageId || null
	);
	const [isUploading, setIsUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Update image when initialImageUrl changes
	useEffect(() => {
		setImage(initialImageUrl || null);
		setImageId(initialImageId || null);
	}, [initialImageUrl, initialImageId]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const lastFile = files[files.length - 1];

			setImage(URL.createObjectURL(lastFile));
			setIsUploading(true);

			try {
				if (!onImageUpload) {
					throw new Error("onImageUpload function is not defined");
				}
				const { path, id } = await onImageUpload(lastFile);
				setImage(path);
				setImageId(id);
			} catch (error) {
				console.error("Upload failed:", error);
				setImage(null);
				setImageId(null);
				if (inputRef.current) {
					inputRef.current.value = "";
				}
			} finally {
				setIsUploading(false);
			}
		}
	};

	const triggerFileInput = () => {
		if (!isUploading) {
			inputRef.current?.click();
		}
	};

	const removeImage = async () => {
		if (!imageId) {
			setImage(null);
			setImageId(null);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
			return;
		}

		try {
			if (onImageRemove) {
				await onImageRemove();
			}
			setImage(null);
			setImageId(null);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		} catch (error) {
			console.error("Failed to remove image:", error);
		}
	};

	return (
		<div className="w-full">
			<input
				type="file"
				name="profilePhoto"
				id="profilePhoto"
				accept="image/png, image/jpg, image/jpeg"
				hidden
				ref={inputRef}
				onChange={handleFileChange}
				disabled={isUploading}
			/>

			{!image ? (
				<label
					htmlFor="profilePhoto"
					className={`flex cursor-pointer flex-col mb-[20px] items-center justify-center p-4 sm:py-10 rounded-md bg-white hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary ${
						isUploading ? "opacity-50" : ""
					}`}
				>
					<Image
						src="/images/media-icon.svg"
						alt="Media Icon"
						width={176}
						height={32}
						className="mb-6"
					/>
					<div className="flex size-13.5 items-center justify-center rounded-[10px] border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
						{isUploading ? (
							<span className="loading-spinner"></span>
						) : (
							<FaPlus />
						)}
					</div>
					<p className="mt-1 text-[.875rem] font-bold">
						{isUploading ? "Uploading..." : "Upload Media"}
					</p>
				</label>
			) : (
				<div className="relative w-full mb-[20px] rounded-lg overflow-hidden border border-gray-300">
					<img
						src={image}
						alt="Uploaded"
						className="w-full h-full object-cover cursor-pointer"
						onClick={triggerFileInput}
					/>

					{!isUploading && (
						<>
							<div
								onClick={triggerFileInput}
								className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition cursor-pointer"
							>
								<FaPlus size={16} />
							</div>

							<div
								onClick={removeImage}
								className="absolute top-2 left-2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition cursor-pointer"
							>
								<FaTimes size={16} className="text-red-600" />
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
