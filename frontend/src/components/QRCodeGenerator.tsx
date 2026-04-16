"use client";

import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Modal } from "@/components/ui";

interface Props {
	url: string;
}

const QRCodeGenerator: React.FC<Props> = ({ url }) => {

	console.log(url, "urlurlurl");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [qrSize, setQrSize] = useState(200);
	useEffect(() => {
		const updateSize = () => {
			setQrSize(window.innerWidth >= 768 ? 500 : 200);
		};
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	const handleDownload = () => {
		const canvas = document.querySelector(
			"#qr-code canvas"
		) as HTMLCanvasElement;
		if (canvas) {
			const dataUrl = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.download = "eduquest-qr.png";
			link.href = dataUrl;
			link.click();
		}
	};

	return (
		<div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 w-full">
			<div
				id="qr-code"
				className="flex items-center justify-center md:justify-start w-full md:w-auto"
			>
				<QRCodeCanvas
					value={url}
					size={100}
					bgColor="#ffffff"
					fgColor="#000000"
					level="H"
				/>
				{/* <p className="pl-3 text-sm md:text-base">QR Code</p> */}
			</div>

			<div className="flex gap-3 justify-center md:justify-end w-full md:w-auto">
				<button
					onClick={handleDownload}
					className="px-5 py-2 text-sm font-bold bg-[#ff9f48] text-white rounded hover:bg-[#556fb6] transition-colors"
				>
					Download
				</button>
				<button
					onClick={() => setIsModalOpen(true)}
					className="px-5 py-2 text-sm font-bold bg-[#bc5eb3] text-white rounded hover:bg-[#556fb6] transition-colors"
				>
					View
				</button>
			</div>

			<Modal
				title=""
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			>
				<div className="flex justify-center items-center py-6">
					<QRCodeCanvas
						value={url}
						size={qrSize}
						bgColor="#ffffff"
						fgColor="#000000"
						level="H"
					/>
				</div>
			</Modal>
		</div>
	);
};

export default QRCodeGenerator;
