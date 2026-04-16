"use client";

import React, { useState, useEffect } from "react";
import { Flex, Modal } from "antd";

interface GlobalModalProps {
	title: string;
	open: boolean;
	onClose?: () => void;
	children: React.ReactNode;
	width?: number | string;
}

const GlobalModal: React.FC<GlobalModalProps> = ({
	title,
	open,
	onClose,
	children,
	width,
}) => {
	const [mounted, setMounted] = useState(false);


	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	// border-[#222] border-b w-full
	return (
		<Flex vertical gap="middle" align="flex-start">
			<Modal
				className="modal_area"
				title={
					<span className="text-[1.25rem] font-semibold ">
						{title}
					</span>
				}
				centered
				open={open}
				onCancel={onClose}
				footer={null}
				width={width || {
					xs: "95%",
					sm: "90%",
					md: "85%",
					lg: "75%",
					xl: "65%",
					xxl: "55%",
				}}
			>
				{children}
			</Modal>
		</Flex>
	);
};

export default GlobalModal;
