"use client";
import React, { useEffect, useMemo, useState, JSX } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import {
	Users,
	User,
	FileSpreadsheet,
	MoreVertical,
	ChevronLeft,
	ChevronRight,
	Search as SearchIcon,
} from "lucide-react";

/* ---------- Types ---------- */
type TabKey = "All" | "Individual";

type Question =
	| { id: string; label: string; type: "text" }
	| { id: string; label: string; type: "choice"; options: string[] };

type ResponseItem = {
	id: string;
	submittedAt: string;
	email?: string;
	name?: string;
	answers: Record<string, string>;
};

/* ---------- Sample schema/data (swap with API) ---------- */
const formTitle = "Diploma Next Step";
const questions: Question[] = [
	{ id: "name_en", label: "নাম (ইংরেজিতে)", type: "text" },
	{
		id: "track",
		label: "Preferred Track",
		type: "choice",
		options: ["Web", "Android", "Data", "UI/UX"],
	},
];

const RESPONSES: ResponseItem[] = [
	{
		id: "r01",
		submittedAt: "2025-08-10T13:22:00Z",
		email: "tazrul@mail.com",
		name: "Tazrul Islam",
		answers: { name_en: "Tazrul Islam", track: "Web" },
	},
	{
		id: "r02",
		submittedAt: "2025-08-10T13:27:00Z",
		email: "shafayet@mail.com",
		name: "Shafayet",
		answers: { name_en: "Shafayet", track: "Android" },
	},
	{
		id: "r03",
		submittedAt: "2025-08-10T13:32:00Z",
		email: "misti@mail.com",
		name: "MST : Saikunnahar Misti",
		answers: { name_en: "MST : Saikunnahar Misti", track: "Web" },
	},
	{
		id: "r04",
		submittedAt: "2025-08-10T13:38:00Z",
		email: "shohel@mail.com",
		name: "MD.Shohel Rana",
		answers: { name_en: "MD.Shohel Rana", track: "Data" },
	},
	{
		id: "r05",
		submittedAt: "2025-08-10T13:45:00Z",
		email: "nadia@mail.com",
		name: "Nadia",
		answers: { name_en: "Nadia", track: "UI/UX" },
	},
];

/* ---------- Utils ---------- */
const fmt = (iso: string) => new Date(iso).toLocaleString();

function toCSV(rows: ResponseItem[], qs: Question[]): string {
	const head = [
		"#",
		"Name",
		"Email",
		"Submitted",
		...qs.map((q) => q.label),
	].join(",");
	const body = rows
		.map((r, i) => {
			const qVals = qs.map((q) => JSON.stringify(r.answers[q.id] ?? ""));
			return [
				i + 1,
				JSON.stringify(r.name ?? ""),
				JSON.stringify(r.email ?? ""),
				JSON.stringify(fmt(r.submittedAt)),
				...qVals,
			].join(",");
		})
		.join("\n");
	return `${head}\n${body}`;
}

function downloadCSV(
	rows: ResponseItem[],
	qs: Question[],
	filename = "responses.csv"
) {
	const blob = new Blob([toCSV(rows, qs)], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/* ---------- Small UI bits ---------- */
type TabsProps = { active: TabKey; onChange: (k: TabKey) => void };
function Tabs({ active, onChange }: TabsProps) {
	const items = useMemo(
		() => [
			{
				key: "All" as const,
				label: "All Summary",
				icon: <Users className="h-4 w-4" />,
			},
			{
				key: "Individual" as const,
				label: "Individual",
				icon: <User className="h-4 w-4" />,
			},
		],
		[]
	);
	return (
		<div
			role="tablist"
			className="inline-flex rounded-2xl border bg-white p-1 "
		>
			{items.map((t) => {
				const isActive = active === t.key;
				return (
					<button
						key={t.key}
						role="tab"
						aria-selected={isActive}
						onClick={() => onChange(t.key)}
						className={[
							"inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
							isActive
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:text-foreground",
						].join(" ")}
					>
						{t.icon}
						{t.label}
					</button>
				);
			})}
		</div>
	);
}

type HeaderActionsProps = {
	onExport: () => void;
	q: string;
	setQ: (v: string) => void;
};
function HeaderActions({ onExport, q, setQ }: HeaderActionsProps) {
	const [open, setOpen] = useState(false);
	return (
		<div className="flex items-center gap-2">
			<div className="relative">
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					type="text"
					placeholder="Search responses"
					className="peer h-10 w-56 rounded-xl border bg-background pl-9 pr-3 text-sm outline-none  focus:ring-2 focus:ring-primary/60"
				/>
				<SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground peer-focus:text-primary" />
			</div>

			<button
				onClick={onExport}
				className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-medium shadow-sm  hover:bg-slate-50"
				title="Export CSV"
			>
				<FileSpreadsheet className="h-4 w-4" />
				Export
			</button>

			<div className="relative">
				<button
					onClick={() => setOpen((s) => !s)}
					className="grid h-10 w-10 place-items-center rounded-xl border bg-white shadow-sm  hover:bg-slate-50"
					aria-haspopup="menu"
					aria-expanded={open}
					aria-label="More actions"
				>
					<MoreVertical className="h-4 w-4" />
				</button>
				{open && (
					<div
						role="menu"
						className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border bg-white p-1 text-sm shadow-xl "
						onMouseLeave={() => setOpen(false)}
					>
						<button
							className="w-full rounded-md px-3 py-2 text-left hover:bg-slate-50"
							onClick={() => setOpen(false)}
						>
							Refresh
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

/* ---------- ApexCharts (client only) ---------- */
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ChoiceChartsProps = {
	question: Extract<Question, { type: "choice" }>;
	rows: ResponseItem[];
};
function ChoiceCharts({ question, rows }: ChoiceChartsProps) {
	const labels = question.options;
	const counts = useMemo(() => {
		const c: Record<string, number> = Object.fromEntries(
			labels.map((l) => [l, 0])
		);
		rows.forEach((r) => {
			const v = r.answers[question.id];
			if (v && v in c) c[v] += 1;
		});
		return labels.map((l) => c[l]);
	}, [labels, question.id, rows]);

	const barOptions: ApexOptions = {
		chart: { type: "bar", toolbar: { show: false } },
		colors: ["#F79945"],
		xaxis: { categories: labels },
		dataLabels: { enabled: false },
		grid: { strokeDashArray: 4 },
	};
	const pieOptions: ApexOptions = {
		chart: { type: "pie" },
		labels,
		legend: { position: "bottom" },
	};

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<div className="rounded-2xl border bg-white p-4 ">
				<div className="mb-2 text-lg font-medium">
					{question.label} — Bar
				</div>
				<ApexChart
					type="bar"
					height={300}
					series={[{ name: "Responses", data: counts }]}
					options={barOptions}
				/>
			</div>
			<div className="rounded-2xl border bg-white p-4 ">
				<div className="mb-2 text-lg font-medium">
					{question.label} — Pie
				</div>
				<ApexChart
					type="pie"
					height={300}
					series={counts}
					options={pieOptions}
				/>
			</div>
		</div>
	);
}

type SummaryListProps = { title: string; values: string[] };
function SummaryList({ title, values }: SummaryListProps) {
	return (
		<div className="rounded-2xl border bg-white ">
			<div className="rounded-t-2xl bg-white p-4">
				<div className="text-lg font-medium">{title}</div>
				<div className="text-sm text-muted-foreground">
					{values.length} responses
				</div>
			</div>
			<div className="max-h-[360px] space-y-3 overflow-auto p-4">
				{values.map((v, i) => (
					<div
						key={`${v}-${i}`}
						className="rounded-xl bg-slate-50 px-4 py-3"
					>
						{v || <span className="text-muted-foreground">—</span>}
					</div>
				))}
			</div>
		</div>
	);
}

type IndividualProps = {
	items: ResponseItem[];
	index: number;
	setIndex: (n: number) => void;
};
function Individual({ items, index, setIndex }: IndividualProps) {
	const r = items[index];
	const total = items.length;
	return (
		<div className="rounded-2xl border bg-white ">
			<div className="flex items-center justify-between border-b p-3">
				<button
					className="grid h-9 w-9 place-items-center rounded-lg border  hover:bg-slate-50 disabled:opacity-40"
					onClick={() => setIndex(Math.max(0, index - 1))}
					disabled={index === 0}
					aria-label="Previous"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<div className="text-sm text-muted-foreground">
					<span className="mr-1 font-medium">{index + 1}</span> of{" "}
					<span className="font-medium">{total}</span>
				</div>
				<button
					className="grid h-9 w-9 place-items-center rounded-lg border  hover:bg-slate-50 disabled:opacity-40"
					onClick={() => setIndex(Math.min(total - 1, index + 1))}
					disabled={index === total - 1}
					aria-label="Next"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<div className="space-y-4 p-4">
				<div>
					<div className="text-2xl font-semibold">{formTitle}</div>
					<div className="text-sm text-muted-foreground">
						Submitted: {fmt(r.submittedAt)}
					</div>
				</div>

				{questions.map((q) => (
					<div key={q.id} className="rounded-xl border p-4 ">
						<div className="text-sm font-medium">{q.label}</div>
						<div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
							{r.answers[q.id] ?? "—"}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ---------- Page ---------- */
export default function QuestResponsePage(): JSX.Element {
	const [active, setActive] = useState<TabKey>("All");
	const [idx, setIdx] = useState<number>(0);
	const [q, setQ] = useState<string>("");

	const filtered: ResponseItem[] = useMemo(() => {
		if (!q.trim()) return RESPONSES;
		const t = q.toLowerCase();
		return RESPONSES.filter(
			(r) =>
				r.name?.toLowerCase().includes(t) ||
				r.email?.toLowerCase().includes(t) ||
				Object.values(r.answers).some((v) =>
					v.toLowerCase().includes(t)
				)
		);
	}, [q]);

	useEffect(() => {
		if (idx > filtered.length - 1) setIdx(0);
	}, [filtered.length, idx]);

	const nameQ = questions.find(
		(qq): qq is Extract<Question, { type: "text" }> =>
			qq.id === "name_en" && qq.type === "text"
	);
	const nameValues = useMemo(
		() => (nameQ ? filtered.map((r) => r.answers[nameQ.id] ?? "") : []),
		[filtered, nameQ]
	);

	const trackQ = questions.find(
		(qq): qq is Extract<Question, { type: "choice" }> =>
			qq.id === "track" && qq.type === "choice"
	);

	return (
		<div className="p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					Quest Responses
				</h1>
				<HeaderActions
					onExport={() => downloadCSV(filtered, questions)}
					q={q}
					setQ={setQ}
				/>
			</div>

			<div className="mt-6">
				<Tabs active={active} onChange={setActive} />
				<div className="mt-4">
					{active === "All" && (
						<div className="space-y-4">
							{nameQ && (
								<SummaryList
									title={nameQ.label}
									values={nameValues}
								/>
							)}
							{trackQ && (
								<ChoiceCharts
									question={trackQ}
									rows={filtered}
								/>
							)}
						</div>
					)}

					{active === "Individual" && filtered.length > 0 && (
						<Individual
							items={filtered}
							index={idx}
							setIndex={setIdx}
						/>
					)}

					{active === "Individual" && filtered.length === 0 && (
						<div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
							No results.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
