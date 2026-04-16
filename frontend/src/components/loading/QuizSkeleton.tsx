"use client";

export default function QuizSkeleton() {
	return (
		<div className="w-full group relative bg-white border dark:bg-gray-800 border-gray-200 rounded-lg shadow dark:border-gray-700 p-5 animate-pulse">
			{/* Title */}
			<div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

			{/* Image */}
			<div className="flex justify-center py-3">
				<div className="h-[120px] w-[120px] bg-gray-200 dark:bg-gray-700 rounded-md" />
			</div>

			{/* User & status */}
			<div className="flex justify-between items-center border-t px-4 py-2">
				<div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
				<div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
			</div>

			{/* Info */}
			<div className="px-4 py-2 space-y-2 text-sm">
				<div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
				<div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
				<div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
			</div>

			{/* Buttons */}
			<div className="px-4 pb-5 flex flex-col xl:flex-row gap-2">
				<div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
				<div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
			</div>
		</div>
	);
}
