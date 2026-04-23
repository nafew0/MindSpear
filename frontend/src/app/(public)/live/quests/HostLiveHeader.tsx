"use client";
import { IoIosClose } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
	onClose?: () => void;
}

export default function HostLiveHeader({ onClose }: HeaderProps) {

	return (
		<div className="flex justify-between items-center px-2">
			<div
				className="w-5 h-5 rounded-full flex justify-center items-center bg-[#2222]"
				onClick={() => onClose?.()}
			>
				<IoIosClose className="text-xl cursor-pointer hover:text-[#f00]" />
			</div>

			<Link href="#">
				<Image
					src="/images/logo/logo.svg"
					alt="Logo"
					width={126}
					height={22}
				/>
			</Link>
		</div>
	);
}
