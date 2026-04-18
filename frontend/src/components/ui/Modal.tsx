"use client";

import * as React from "react";
import { Modal as AntModal, type ModalProps as AntModalProps } from "antd";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalProps = {
	title: React.ReactNode;
	open: boolean;
	onClose?: () => void;
	children: React.ReactNode;
	size?: ModalSize;
	width?: AntModalProps["width"];
	className?: string;
	footer?: AntModalProps["footer"];
	centered?: boolean;
	destroyOnClose?: boolean;
};

const sizeWidths: Record<ModalSize, AntModalProps["width"]> = {
	sm: 420,
	md: {
		xs: "95%",
		sm: "90%",
		md: "760px",
		lg: "760px",
		xl: "760px",
		xxl: "760px",
	},
	lg: {
		xs: "95%",
		sm: "90%",
		md: "85%",
		lg: "75%",
		xl: "65%",
		xxl: "55%",
	},
	xl: {
		xs: "95%",
		sm: "90%",
		md: "90%",
		lg: "90%",
		xl: "90%",
		xxl: "90%",
	},
	full: "96vw",
};

export function Modal({
	title,
	open,
	onClose,
	children,
	size = "lg",
	width,
	className,
	footer = null,
	centered = true,
	destroyOnClose = false,
}: ModalProps) {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<AntModal
			className={cn("modal_area", className)}
			title={<span className="text-[1.25rem] font-semibold">{title}</span>}
			centered={centered}
			open={open}
			onCancel={onClose}
			onOk={onClose}
			footer={footer}
			width={width ?? sizeWidths[size]}
			destroyOnHidden={destroyOnClose}
		>
			{children}
		</AntModal>
	);
}
