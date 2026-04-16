"use client";

import React from "react";
import { Pagination } from "antd";

interface GlobalPaginationProps {
	current: number;
	total: number;
	pageSize?: number;
	onChange: (page: number, pageSize?: number) => void;
}

const GlobalPagination: React.FC<GlobalPaginationProps> = ({
	current,
	total,
	pageSize = 12,
	onChange,
}) => {
	const handleChange = (page: number, newPageSize?: number) => {
		// If page size changes, reset to first page
		if (newPageSize && newPageSize !== pageSize) {
			onChange(1, newPageSize);
		} else {
			onChange(page, newPageSize || pageSize);
		}
	};
	const showPagination = total > 0;

	if (!showPagination) return null;

	return (
		<div className="flex justify-center mt-6 dark:bg-black">
			<Pagination
				current={current}
				total={total}
				pageSize={pageSize}
				onChange={handleChange}
				showSizeChanger
				pageSizeOptions={["5", "10", "20", "50", "100"]}
				onShowSizeChange={handleChange}
				showQuickJumper={false}
			/>
		</div>
	);
};

export default GlobalPagination;