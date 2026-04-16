/* eslint-disable @typescript-eslint/no-explicit-any */
// components/editor/TemplateSelector.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mainTemplates, allTemplateCategories } from "@/constants/templates";
import { TemplateCard } from "./TemplateCard";
import GlobalModal from "@/components/globalModal";
import StylableInput from "@/lib/StylableInput";

// interface TemplateSelectorProps {
// 	onTemplateSelect: (templateId: number) => void;
// }

export function TemplateSelector({ onTemplateSelect }: any) {
	const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);
	const [templateModalOpen, setTemplateModalOpen] = useState(false);

	const handleTemplateClick = (id: number) => {
		if (id === 6) {
			setTemplateModalOpen(true);
		} else {
			onTemplateSelect(id);
		}
	};

	const handleAllTemplateClick = (id: number) => {
		setTemplateModalOpen(false);
		onTemplateSelect(id);
	};

	return (
		<div className="flex flex-col items-center justify-center px-4">
			<div className="w-full">
				<StylableInput style="quest" />
			</div>

			<div className="text-center my-4 mt-10">
				<p className="text-slate-500 dark:text-slate-400 text-lg">
					Choose a template to get started
				</p>
			</div>

			<div className="w-full max-w-4xl">
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
					{mainTemplates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							selected={false}
							hovered={hoveredTemplate === template.id}
							onHover={setHoveredTemplate}
							onClick={handleTemplateClick}
						/>
					))}
				</div>
			</div>

			{/* All Templates Modal */}
			<GlobalModal
				title="Choose a Template"
				open={templateModalOpen}
				onClose={() => setTemplateModalOpen(false)}
			>
				<div className="p-6 max-h-[70vh] overflow-y-auto">
					<div className="space-y-8">
						{allTemplateCategories.map((category, categoryIndex) => (
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
											hovered={hoveredTemplate === template.id}
											onHover={setHoveredTemplate}
											onClick={handleAllTemplateClick}
										/>
									))}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</GlobalModal>
		</div>
	);
}