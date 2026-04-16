// constants/templates.ts
import { ImageIcon, LayoutGrid, Columns, Grid3X3 } from "lucide-react";

export const mainTemplates = [
	{
		id: 2,
		name: "Image and text",
		icon: ImageIcon,
		description: "Image left, text right",
		category: "text-image",
	},
	{
		id: 3,
		name: "Text and image",
		icon: ImageIcon,
		description: "Text left, image right",
		category: "text-image",
	},
	{
		id: 4,
		name: "Two columns",
		icon: Columns,
		description: "Equal width columns",
		category: "columns",
	},
	{
		id: 6,
		name: "Templates",
		icon: LayoutGrid,
		description: "Browse all templates",
		category: "all",
	},
];

export const allTemplateCategories = [
	{
		name: "Text & Image",
		templates: [
			{
				id: 2, // Changed from 4 to 2
				name: "Image and text",
				icon: ImageIcon,
				description: "Image left, text right",
				category: "text-image",
			},
			{
				id: 3, // Changed from 5 to 3
				name: "Text and image",
				icon: ImageIcon,
				description: "Text left, image right",
				category: "text-image",
			},
		],
	},
	{
		name: "Columns",
		templates: [
			{
				id: 4,
				name: "Two columns",
				icon: Columns,
				description: "Equal width columns",
				category: "columns",
			},
			{
				id: 8,
				name: "Three columns",
				icon: Grid3X3,
				description: "Three column layout",
				category: "columns",
			},
		],
	},
	{
		name: "Media",
		templates: [
			{
				id: 11,
				name: "Image gallery",
				icon: LayoutGrid,
				description: "Grid of images",
				category: "media",
			},
		],
	},
];
