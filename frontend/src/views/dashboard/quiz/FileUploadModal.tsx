/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { getPdfPageCount } from "@/utils/pdfUtils";

type FileUploadBoxProps = {
	onFileUpload: (file: File) => void;
};

const MAX_SIZE_MB = 100;
// const MAX_PAGES = 25;

export default function FileUploadModal({ onFileUpload }: FileUploadBoxProps) {
	const [fileError, setFileError] = useState<string | null>(null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);

	// Function to handle PDF file page count validation
	const checkPdfPages = async (file: File) => {
		try {
			const pageCount = await getPdfPageCount(file);
			// if (pageCount > MAX_PAGES) {
			// 	setFileError(
			// 		`The PDF file exceeds the ${MAX_PAGES} pages limit.`
			// 	);
			// 	return false;
			// }
			return true;
		} catch (error) {
			setFileError("Failed to read the PDF file.");
			return false;
		}
	};
	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (!file) return;

			// Check file size
			if (file.size > MAX_SIZE_MB * 1024 * 1024) {
				setFileError(`File exceeds ${MAX_SIZE_MB}MB limit.`);
				return;
			}

			// Check if file is PDF, PPT, or PPTX
			if (
				!file.name.endsWith(".pdf") &&
				!file.name.endsWith(".ppt") &&
				!file.name.endsWith(".pptx")
			) {
				setFileError("Only .pdf, .ppt, and .pptx files are supported.");
				return;
			}

			// Validate pages based on file type
			let isValid = false;
			if (file.name.endsWith(".pdf")) {
				isValid = await checkPdfPages(file); // Check PDF page count
			}
			if (isValid) {
				// If valid, clear the error and trigger the upload handler
				setFileError(null);
				setUploadedFile(file);
				onFileUpload(file);
			}
		},
		[onFileUpload]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
	});

	return (
		<section className="w-full mx-auto p-6 bg-white ">
			<div
				{...getRootProps()}
				className={clsx(
					"border-2 border-dashed rounded-xl flex flex-col items-center justify-center px-6 py-10 text-center cursor-pointer transition",
					isDragActive
						? "border-primary-500 bg-primary-50"
						: "border-gray-300"
				)}
			>
				<input {...getInputProps()} accept=".pdf,.ppt,.pptx" />
				<UploadCloud className="h-10 w-10 text-gray-400 mb-4" />
				<p className="text-gray-700 font-medium">
					{uploadedFile ? uploadedFile.name : "Drop your file here"}
				</p>
				<p className="text-sm text-gray-500 mt-1">
					Max file size: <strong>{MAX_SIZE_MB}MB</strong> <br />
					{/* Limit: approximately <strong>{MAX_PAGES} pages</strong>{" "} */}
					{/* <br /> */}
					Format: <strong>.pdf, .ppt, .pptx</strong>
				</p>
			</div>

			{fileError && (
				<p className="text-sm text-red-500 mt-2">{fileError}</p>
			)}

			<p className="mt-4 text-xs text-gray-400 text-center">
				Uploads must comply with our{" "}
				<Link
					href="#"
					className="text-primary underline hover:text-primary-700"
				>
					Acceptable Use Policy
				</Link>
			</p>
		</section>
	);
}
