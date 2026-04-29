"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { QuestHostVolumeControl } from "@/features/live/components/quest-host-ui/QuestHostVolumeControl";

interface HeaderProps {
	onClose?: () => void;
}

export default function HostLiveHeader({ onClose }: HeaderProps) {
	return (
		<header className="mx-auto flex w-full max-w-[1500px] items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur sm:px-4">
			<button
				type="button"
				className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
				onClick={() => onClose?.()}
				aria-label="Close host live"
			>
				<X className="h-5 w-5" />
			</button>

			<Link href="#" className="inline-flex items-center justify-center">
				<Image
					src="/images/logo/logo.svg"
					alt="MindSpear"
					width={126}
					height={22}
					priority
				/>
			</Link>

			<div className="flex items-center justify-end gap-2">
				<QuestHostVolumeControl className="scale-90 sm:scale-100" />
				<div className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-primary lg:block">
					Quest live
				</div>
			</div>
		</header>
	);
}
