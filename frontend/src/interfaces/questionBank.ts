export interface APICategory {
	id: number;
	name: string;
	description: string;
	is_parent: boolean;
	parent_category_id: number | null;
	created_by: {
		id: number;
		first_name: string;
		last_name: string;
		email: string;
		full_name: string;
	};
	created_at: string;
	updated_at: string;
	parent_category: any | null;
	sub_categories: any[];
	color_code?: string;
}