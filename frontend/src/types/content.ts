/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ContentBlock {
	id: string;
	type: "text" | "image" | "columns" | "heading" | "text-image";
	content: string;
	alignment: "left" | "center" | "right";
	imageUrl?: string;
	imagePosition?: "left" | "right";
	children?: ContentBlock[];
}

export interface Template {
	id: number;
	name: string;
	description: string;
	icon: any;
	category?: string;
}
