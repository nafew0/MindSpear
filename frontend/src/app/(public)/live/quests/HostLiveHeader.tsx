/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { IoIosClose } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
// import { clearCache } from "@/services/redux/features/leaderboardSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { emitEndQuest, setCurrentQuest } from "@/socket/quest-socket";
// import { useSearchParams, useRouter, useParams } from "next/navigation";
// import { emitEndQuiz } from "@/socket/socket";

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
