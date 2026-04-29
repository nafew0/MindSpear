"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	CheckCircle2,
	Clock3,
	Radio,
	Sparkles,
	Users,
	Wifi,
	WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShellProps = {
	children: React.ReactNode;
	className?: string;
	isFullscreen?: boolean;
};

export function QuestHostLiveShell({
	children,
	className,
	isFullscreen = false,
}: ShellProps) {
	return (
		<div
			className={cn(
				"relative min-h-[100dvh] overflow-hidden bg-white text-slate-950",
				isFullscreen && "fixed inset-0 z-50",
				className,
			)}
		>
			<div className="relative z-10 flex min-h-[100dvh] flex-col">
				{children}
			</div>
		</div>
	);
}

export function QuestHostStage({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<main
			className={cn(
				"mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-3 pb-28 pt-3 sm:px-5 lg:px-8",
				className,
			)}
		>
			<div className="flex min-h-[calc(100dvh-132px)] flex-1 flex-col rounded-[24px] border border-white/80 bg-white/[.92] shadow-[0_26px_80px_rgba(15,23,42,.14)] backdrop-blur">
				{children}
			</div>
		</main>
	);
}

export function QuestHostQuestionHeader({
	title,
	viewLabel,
	responseCount,
	totalSlidesLabel,
	progressRef,
	timeRef,
	timeLabel,
	children,
}: {
	title: React.ReactNode;
	viewLabel: string;
	responseCount?: number;
	totalSlidesLabel?: string;
	progressRef?: React.RefObject<HTMLSpanElement | null>;
	timeRef?: React.RefObject<HTMLSpanElement | null>;
	timeLabel?: string;
	children?: React.ReactNode;
}) {
	return (
		<header className="border-b border-slate-200/80 px-4 py-4 sm:px-6 lg:px-8">
			<div className="min-w-0">
				<div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
						<Sparkles className="h-3.5 w-3.5" />
						{viewLabel}
					</span>
					{totalSlidesLabel ? (
						<span className="rounded-full bg-secondary/10 px-3 py-1 text-secondary">
							{totalSlidesLabel}
						</span>
					) : null}
					<span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
						{responseCount ?? 0} responses
					</span>
				</div>
				<h1 className="break-words text-balance text-2xl font-black leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
					{title}
				</h1>
			</div>

			<div className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between gap-3">
					<span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
						<Clock3 className="h-4 w-4 text-primary" />
						Remaining time
					</span>
					<span
						ref={timeRef}
						className="font-mono text-2xl font-black tabular-nums text-slate-950"
					>
						{timeLabel}
					</span>
				</div>
				<div className="h-3 overflow-hidden rounded-full bg-slate-100">
					<span
						ref={progressRef}
						className="block h-full rounded-full bg-primary"
						style={{ width: "0%", transition: "width 100ms linear" }}
						aria-label="time progress"
					/>
				</div>
			</div>
			{children}
		</header>
	);
}

export function QuestHostResponsePanel({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<section
			className={cn(
				"flex flex-1 flex-col overflow-hidden px-3 py-4 sm:px-6 lg:px-8 lg:py-6",
				className,
			)}
		>
			<div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,.08)]">
				{children}
			</div>
		</section>
	);
}

export function QuestHostWaitingStage({
	title = "Waiting for responses",
	subtitle = "Participant answers will appear here in real time.",
	responseCount = 0,
	participantCount,
}: {
	title?: string;
	subtitle?: string;
	responseCount?: number;
	participantCount?: number;
}) {
	return (
		<div className="relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden bg-white px-6 py-10 text-center text-slate-950">
			<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,153,69,.10)_1px,transparent_1px),linear-gradient(rgba(188,94,179,.10)_1px,transparent_1px)] bg-[size:34px_34px]" />
			<div className="absolute inset-x-0 top-0 h-1 bg-primary" />
			<div className="relative mx-auto max-w-xl">
				<div className="mx-auto mb-8 grid h-28 w-28 place-items-center rounded-[30px] border border-primary/20 bg-primary/10 shadow-sm">
					<motion.div
						animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
						transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
						className="grid h-20 w-20 place-items-center rounded-3xl bg-primary text-white"
					>
						<Radio className="h-10 w-10" />
					</motion.div>
				</div>
				<div className="mb-5 flex justify-center gap-2">
					{[0, 1, 2, 3, 4].map((item) => (
						<motion.span
							key={item}
							animate={{ height: [18, 48, 24, 38, 18] }}
							transition={{
								duration: 1.7,
								repeat: Infinity,
								delay: item * 0.14,
								ease: "easeInOut",
							}}
							className={cn(
								"w-3 rounded-full",
								item % 3 === 0
									? "bg-primary"
									: item % 3 === 1
										? "bg-secondary"
										: "bg-accent",
							)}
						/>
					))}
				</div>
				<h2 className="text-3xl font-black sm:text-4xl">{title}</h2>
				<p className="mt-3 text-base font-medium text-slate-600">{subtitle}</p>
				<div className="mt-7 flex flex-wrap justify-center gap-3">
					<LiveMetric label="Responses" value={responseCount} icon={<Activity />} />
					{typeof participantCount === "number" ? (
						<LiveMetric label="Joined" value={participantCount} icon={<Users />} />
					) : null}
				</div>
			</div>
		</div>
	);
}

function LiveMetric({
	label,
	value,
	icon,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
}) {
	return (
		<div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-left shadow-sm">
			<span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:h-4 [&_svg]:w-4">
				{icon}
			</span>
			<span>
				<span className="block text-lg font-black leading-none">{value}</span>
				<span className="text-xs font-bold uppercase tracking-wide text-slate-500">
					{label}
				</span>
			</span>
		</div>
	);
}

export function QuestHostConnectionPill({
	connected,
	label,
}: {
	connected: boolean;
	label: string;
}) {
	const Icon = connected ? Wifi : WifiOff;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide",
				connected
					? "bg-primary/10 text-primary"
					: "bg-accent/10 text-accent",
			)}
		>
			<Icon className="h-4 w-4" />
			{label}
		</span>
	);
}

export function QuestHostMetricCard({
	label,
	value,
	icon,
	tone = "primary",
}: {
	label: string;
	value: React.ReactNode;
	icon?: React.ReactNode;
	tone?: "primary" | "secondary" | "slate" | "success" | "accent";
}) {
	const toneClass =
		tone === "secondary"
			? "bg-secondary/10 text-secondary"
			: tone === "accent"
				? "bg-accent/10 text-accent"
			: tone === "success"
				? "bg-primary/10 text-primary"
				: tone === "slate"
					? "bg-slate-100 text-slate-700"
					: "bg-primary/10 text-primary";

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className="mb-3 flex items-center justify-between gap-3">
				<span className="text-xs font-black uppercase tracking-wide text-slate-500">
					{label}
				</span>
				{icon ? (
					<span
						className={cn(
							"grid h-9 w-9 place-items-center rounded-xl [&_svg]:h-4 [&_svg]:w-4",
							toneClass,
						)}
					>
						{icon}
					</span>
				) : null}
			</div>
			<div className="text-2xl font-black text-slate-950">{value}</div>
		</div>
	);
}

export function QuestHostResultStage({
	title,
	subtitle,
	actions,
	children,
}: {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
	children?: React.ReactNode;
}) {
	return (
		<div className="flex min-h-[calc(100dvh-90px)] items-center justify-center px-4 py-8">
			<motion.section
				initial={{ opacity: 0, y: 18 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: "easeOut" }}
				className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,.16)]"
			>
				<div className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 px-6 py-10 text-center text-slate-950 sm:px-10">
					<div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[24px] bg-primary text-white shadow-lg shadow-primary/20">
						<CheckCircle2 className="h-10 w-10" />
					</div>
					<h1 className="text-3xl font-black sm:text-5xl">{title}</h1>
					{subtitle ? (
						<p className="mx-auto mt-3 max-w-2xl text-base font-medium text-slate-600">
							{subtitle}
						</p>
					) : null}
				</div>
				{children ? <div className="p-5 sm:p-7">{children}</div> : null}
				{actions ? (
					<div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-center">
						{actions}
					</div>
				) : null}
			</motion.section>
		</div>
	);
}

export function QuestHostControlDock({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/80 bg-white/95 px-3 py-3 shadow-[0_18px_60px_rgba(15,23,42,.28)] backdrop-blur",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function QuestHostEmptyChart({
	title = "No responses yet",
	description = "The chart will update as soon as participants submit answers.",
}: {
	title?: string;
	description?: string;
}) {
	return (
		<div className="flex min-h-[300px] flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
			<div>
				<div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
					<BarChart3 className="h-7 w-7" />
				</div>
				<h3 className="text-lg font-black text-slate-900">{title}</h3>
				<p className="mt-2 max-w-md text-sm font-medium text-slate-500">
					{description}
				</p>
			</div>
		</div>
	);
}

export function AnimatedResponseGrid({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			layout
			className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}
		>
			<AnimatePresence initial={false}>{children}</AnimatePresence>
		</motion.div>
	);
}
