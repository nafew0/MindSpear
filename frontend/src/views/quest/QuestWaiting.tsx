import React from "react";

const QuestWaiting: React.FC = () => {
	return (
		<div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden px-4 py-12">
			{/* soft glow bg */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute bottom-6 left-8 h-40 w-40 rounded-full bg-purple-400/10 blur-2xl" />
				<div className="absolute right-10 top-6 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
			</div>

			{/* card */}
			<div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 backdrop-blur">
				{/* icon */}
				<div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
					{/* hourglass icon (inline svg) */}
					<svg
						viewBox="0 0 24 24"
						className="h-7 w-7 text-primary"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden
					>
						<path d="M6 2h12M6 22h12M6 2v4a6 6 0 0 0 2.1 4.6L12 12l3.9-1.4A6 6 0 0 0 18 6V2" />
						<path d="M18 22v-4a6 6 0 0 0-2.1-4.6L12 12l-3.9 1.4A6 6 0 0 0 6 18v4" />
					</svg>
				</div>

				{/* title */}
				<h2 className="mt-6 text-center text-2xl font-semibold text-foreground">
					Wait for Next Slide
				</h2>

				{/* subtitle */}
				<p className="mt-2 text-center text-sm text-muted-foreground">
					Please wait for the presenter to change Quest.
				</p>

				{/* live pill */}
				<div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
					<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
					Live sync with host
				</div>

				{/* dots loader */}
				<div className="mt-6 flex items-center justify-center gap-2">
					<span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
					<span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/80 [animation-delay:150ms]" />
					<span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
				</div>

				{/* helper text */}
				<p className="mt-4 text-center text-xs text-muted-foreground">
					This screen updates automatically when the presenter
					advances.
				</p>
			</div>
		</div>
	);
};

export default QuestWaiting;
