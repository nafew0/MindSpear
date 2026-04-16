import { cn } from "@/lib/utils";

type LoaderProps = {
	label?: string;
	className?: string;
};

export function Loader({ label = "Loading...", className }: LoaderProps) {
	return (
		<div className={cn("flex items-center justify-center gap-3 py-6", className)}>
			<span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			<span className="text-sm text-dark-5 dark:text-dark-7">{label}</span>
		</div>
	);
}
