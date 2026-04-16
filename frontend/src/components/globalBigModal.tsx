"use client";

import React, { useState, useEffect } from "react";
import { Flex, Modal } from "antd";

interface GlobalModalProps {
	title: string;
	open: boolean;
	onClose?: () => void;
	children: React.ReactNode;
}

const GlobalBigModal: React.FC<GlobalModalProps> = ({
	title,
	open,
	onClose,
	children,
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
				// className="modal_area"
				title={
					<span className="text-[1.25rem] font-semibold ">
						{title}
					</span>
				}
				centered
				open={open}
				onOk={onClose}
				onCancel={onClose}
				footer={null}
				width={{
					xs: "90%",
					sm: "80%",
					md: "90%",
					lg: "90%",
					xl: "90%",
					xxl: "90%",
				}}
			>
				{children}
			</Modal>
		</Flex>
	);
};

export default GlobalBigModal;
