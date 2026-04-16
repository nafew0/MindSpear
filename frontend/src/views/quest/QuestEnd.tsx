import React from "react";

const QuestEnd: React.FC = () => {
	return (
		<div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden px-4 py-12">
			{/* Soft background glow */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-purple-400/10 blur-2xl" />
				<div className="absolute right-10 top-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
			</div>

			{/* Card */}
			<div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card/80 p-8  backdrop-blur">
				{/* Icon */}
				<div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
					{/* Graduation cap (inline SVG to avoid extra deps) */}
					<svg
						viewBox="0 0 24 24"
						className="h-8 w-8 text-primary"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden
					>
						<path d="m22 10-10-5-10 5 10 5 10-5" />
						<path d="M6 12v5c0 .6.4 1 1 1h1" />
						<path d="M18 12v5c0 .6-.4 1-1 1h-1" />
					</svg>
				</div>

				{/* Title */}
				<h1 className="mt-6 text-center text-2xl font-semibold text-foreground">
					Thank you for joining
				</h1>
				<p className="mt-2 text-center text-sm text-muted-foreground">
					You’re all set. Tap the button below to enter MindSpear.
				</p>

				{/* CTA */}
				<div className="mt-6">
					<button
						type="button"
						className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-white  transition  focus:outline-none focus:ring-2 focus:ring-primary/30"
					>
						<span className="translate-y-[0.5px]">
							Join MindSpear
						</span>
						<svg
							viewBox="0 0 24 24"
							className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden
						>
							<path d="M5 12h14" />
							<path d="m12 5 7 7-7 7" />
						</svg>
					</button>
				</div>

				{/* Tiny footer note (optional visual balance) */}
				<p className="mt-3 text-center text-xs text-muted-foreground">
					Need help? Contact support anytime.
				</p>
			</div>
		</div>
	);
};

export default QuestEnd;
