"use client";

import { Pagination as AntPagination, type PaginationProps } from "antd";

export function Pagination(props: PaginationProps) {
	return <AntPagination showSizeChanger={false} {...props} />;
}
