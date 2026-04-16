"use client";
import React from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";

export default function FileUploadLoader({
	isComplete = false,
}: {
	isComplete?: boolean;
}) {
	return (
		<div className="w-60 h-60 flex flex-col items-center justify-center">
			<div className="w-16 h-16 mb-4 relative z-10 text-primary dark:text-primary">
				{isComplete ? (
					<CheckCircle2 size={64} />
				) : (
					<UploadCloud size={64} />
				)}
			</div>

			<div className="w-3 h-40 relative bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full shadow-inner">
				<div className="absolute bottom-0 left-0 w-full h-full animate-upload-progress bg-gradient-to-t from-primary to-primary dark:from-primary dark:to-primary" />
			</div>

			<p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
				{isComplete ? "Upload Complete" : "Uploading..."}
			</p>
		</div>
	);
}
