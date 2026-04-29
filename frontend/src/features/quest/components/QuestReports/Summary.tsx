'use client';
import React, { useEffect, useState } from 'react'
import { RadialMetricChart as RadialBarCharts } from "@/components/charts";
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { useParams } from "next/navigation";
import axiosInstance from '@/utils/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { Copy, Hash, Link2, QrCode } from 'lucide-react';


interface pNumber {
	participantsNumber: number;
	urlnamelive?: string;
}
// participantsNumber

const Summary: React.FC<pNumber> = ({
	participantsNumber,
	urlnamelive
}) => {

	const params = useParams();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [response, setresponse] = useState<any | null>(null);
	const [copiedCode, setCopiedCode] = useState(false);
	const [copiedUrl, setCopiedUrl] = useState(false);
	const [origin, setOrigin] = useState('');

	const questSession = useSelector(
		(state: RootState) => state.questSession.questSession
	);


	useEffect(() => {
		if (typeof window !== 'undefined') {
			setOrigin(window.location.origin);
		}
	}, []);

	useEffect(() => {
		const dataFetch = async () => {
			const responseData = await axiosInstance.get(
				`/quests/show/${params?.id}`
			);
			setresponse(responseData?.data?.data?.quest);
		};
		dataFetch();
	}, [params?.id]);

	const joinCode = response?.join_code;
	const liveurlname = urlnamelive !== undefined && urlnamelive !== null ? urlnamelive : ""
	const fullUrl = `${origin}/attempt/${liveurlname}${joinCode}?jid=${response?.join_link}&qid=${response?.id}&secid=${questSession?.id}`;


	const handleCopy = (text: string, type: 'code' | 'url') => {
		if (!text) return;
		navigator.clipboard.writeText(text).then(() => {
			if (type === 'code') {
				setCopiedCode(true);
				setTimeout(() => setCopiedCode(false), 2000);
			} else {
				setCopiedUrl(true);
				setTimeout(() => setCopiedUrl(false), 2000);
			}
		});
	};



	return (
		<div className='grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]'>
			<div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
				<div className="grid gap-6 md:grid-cols-[1fr_260px] md:items-center">
					<div>
						<p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary">
							<Link2 className="h-4 w-4" />
							Invite participants
						</p>
						<h3 className="text-2xl font-black text-slate-950 sm:text-3xl">
							Share the link or Quest ID to fill the room.
						</h3>
						<p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
							Participants can join this MindSpear until the session ends. The live
							queue updates automatically as they arrive.
						</p>
					</div>
					<div className="mx-auto w-full max-w-[240px]">
						<RadialBarCharts key={participantsNumber} participantsNumber={participantsNumber} />
					</div>
				</div>
			</div>

			<div className='rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm'>
				<div className='mb-4 flex items-center gap-2 text-sm font-black text-slate-700'>
					<QrCode className="h-5 w-5 text-secondary" />
					Join Details
				</div>

				<div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50'>
					<QRCodeGenerator url={fullUrl} />
				</div>

				<CopyRow
					icon={<Hash className="h-4 w-4" />}
					label="Join Code"
					value={joinCode || ""}
					copied={copiedCode}
					onCopy={() => handleCopy(joinCode, 'code')}
				/>

				<CopyRow
					icon={<Link2 className="h-4 w-4" />}
					label="Join Link"
					value={fullUrl}
					copied={copiedUrl}
					onCopy={() => handleCopy(fullUrl, 'url')}
				/>
			</div>
		</div>
	)
}

export default Summary

function CopyRow({
	icon,
	label,
	value,
	copied,
	onCopy,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	copied: boolean;
	onCopy: () => void;
}) {
	return (
		<div className='mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4'>
			<div className='min-w-0'>
				<h5 className='flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500'>
					<span className="text-primary">{icon}</span>
					{label}
				</h5>
				<p className='truncate font-black text-slate-950'>
					{value || "Unavailable"}
				</p>
			</div>
			<button
				type="button"
				className="inline-flex shrink-0 items-center gap-2 rounded bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
				onClick={onCopy}
				disabled={!value}
			>
				<Copy className="h-4 w-4" />
				{copied ? 'Copied' : 'Copy'}
			</button>
		</div>
	);
}
