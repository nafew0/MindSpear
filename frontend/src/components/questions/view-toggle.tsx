"use client";

interface ViewToggleProps {
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
	return (
		<div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
			<button
				onClick={() => onViewModeChange("list")}
				className={`p-2 ${
					viewMode === "list"
						? "bg-primary text-white"
						: "bg-white text-gray-600 hover:bg-gray-50"
				}`}
			>
				☰
			</button>
			<button
				onClick={() => onViewModeChange("grid")}
				className={`p-2 ${
					viewMode === "grid"
						? "bg-primary text-white"
						: "bg-white text-gray-600 hover:bg-gray-50"
				}`}
			>
				⊞
			</button>
		</div>
	);
}
