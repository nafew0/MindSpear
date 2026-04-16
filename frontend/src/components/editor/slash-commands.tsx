// components/editor/slash-commands.tsx
"use client";

import {
	FileText,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	CheckSquare,
	Code,
	Quote,
	Divide,
	Table,
	Image as ImageIcon,
	Youtube,
	FileUp,
	Calculator,
	Calendar,
	BarChart3,
	Database,
	MessageSquare,
	AtSign,
	Video,
	FileCode,
	Columns,
} from "lucide-react";

const slashCommands = [
	// Text & Headings
	{
		title: "Text",
		description: "Just start writing with plain text",
		icon: FileText,
		command: () => {
			// Text command implementation
		}
	},
	{
		title: "Heading 1",
		description: "Large section heading",
		icon: Heading1,
		command: () => {
			// Heading 1 command implementation
		}
	},
	{
		title: "Heading 2",
		description: "Medium section heading",
		icon: Heading2,
		command: () => {
			// Heading 2 command implementation
		}
	},
	{
		title: "Heading 3",
		description: "Small section heading",
		icon: Heading3,
		command: () => {
			// Heading 3 command implementation
		}
	},
	// ... rest of the commands (simplified for brevity)
];

interface SlashCommandsProps {
	query: string;
	onQueryChange: (query: string) => void;
	onCommand: (command: any) => void;
}

export function SlashCommands({ query, onQueryChange, onCommand }: SlashCommandsProps) {
	const filteredCommands = slashCommands.filter(command =>
		command.title.toLowerCase().includes(query.toLowerCase()) ||
		command.description.toLowerCase().includes(query.toLowerCase())
	);

	const groupedCommands = {
		"Text & Headings": filteredCommands.filter(cmd =>
			["Text", "Heading 1", "Heading 2", "Heading 3"].includes(cmd.title)
		),
		"Lists": filteredCommands.filter(cmd =>
			["Bullet List", "Numbered List", "To-do List"].includes(cmd.title)
		),
		"Blocks": filteredCommands.filter(cmd =>
			["Code Block", "Quote", "Divider", "Table"].includes(cmd.title)
		),
		"Media": filteredCommands.filter(cmd =>
			["Image", "Video", "YouTube", "File"].includes(cmd.title)
		),
		"Advanced": filteredCommands.filter(cmd =>
			["Mention", "Comment", "Math", "Columns"].includes(cmd.title)
		),
	};

	return (
		<div className="absolute top-0 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md z-50 max-w-72 max-h-96 overflow-y-auto">
			<div className="p-2 border-b border-slate-200 dark:border-slate-700">
				<input
					placeholder="Filter commands..."
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200"
					autoFocus
				/>
			</div>
			<div className="p-1">
				{Object.entries(groupedCommands).map(([category, commands]) => (
					commands.length > 0 && (
						<div key={category}>
							<div className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
								{category}
							</div>
							{commands.map((command) => (
								<button
									key={command.title}
									className="flex items-center gap-3 w-full p-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
									onClick={() => onCommand(command)}
								>
									<command.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
									<div className="flex-1 text-left">
										<div className="font-medium text-slate-700 dark:text-slate-200">{command.title}</div>
										<div className="text-xs text-slate-500 dark:text-slate-400">{command.description}</div>
									</div>
								</button>
							))}
						</div>
					)
				))}
				{filteredCommands.length === 0 && (
					<div className="p-2 text-sm text-slate-500 dark:text-slate-400 text-center">
						No commands found
					</div>
				)}
			</div>
		</div>
	);
}