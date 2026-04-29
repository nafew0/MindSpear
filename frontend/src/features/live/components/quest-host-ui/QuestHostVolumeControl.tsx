"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	getQuestHostVolume,
	setQuestHostVolume,
	startQuestHostMusic,
	subscribeQuestHostAudio,
} from "@/features/live/services/questHostAudio";

type QuestHostVolumeControlProps = {
	className?: string;
};

export function QuestHostVolumeControl({
	className,
}: QuestHostVolumeControlProps) {
	const [volume, setVolume] = useState(1);

	useEffect(() => {
		setVolume(getQuestHostVolume());
		return subscribeQuestHostAudio(() => setVolume(getQuestHostVolume()));
	}, []);

	const percent = Math.round(volume * 100);
	const Icon = volume <= 0 ? VolumeX : Volume2;

	const updateVolume = (nextPercent: number) => {
		const nextVolume = nextPercent / 100;
		setVolume(nextVolume);
		setQuestHostVolume(nextVolume);
		void startQuestHostMusic();
	};

	return (
		<div
			className={cn(
				"inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-2.5 text-slate-700 shadow-sm backdrop-blur",
				className,
			)}
			aria-label="Background music volume"
		>
			<button
				type="button"
				className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
				onClick={() => updateVolume(volume > 0 ? 0 : 100)}
				aria-label={volume > 0 ? "Mute background music" : "Unmute background music"}
			>
				<Icon className="h-4 w-4" />
			</button>
			<input
				type="range"
				min={0}
				max={100}
				value={percent}
				onPointerDown={() => void startQuestHostMusic()}
				onChange={(event) => updateVolume(Number(event.target.value))}
				className="h-1.5 w-16 accent-primary"
				aria-label="Background music volume"
			/>
			<span className="w-8 text-right text-[11px] font-black tabular-nums text-slate-500">
				{percent}%
			</span>
		</div>
	);
}
