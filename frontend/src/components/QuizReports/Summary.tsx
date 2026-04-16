/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Quiz } from '@/types/types';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import RadialBarCharts from '@/components/Chart/RadialBarCharts';
import QRCodeGenerator from '@/components/QRCodeGenerator';


interface QuizState {
	quiz: Quiz;
}
interface RootState {
	quizInformation: {
		quizInformation: QuizState;
	};
}
interface pNumber {
	participantsNumber: number;
	urlnamelive?: string;
}
// participantsNumber

const Summary: React.FC<pNumber> = ({
	participantsNumber,
	urlnamelive
}) => {


	const response = useSelector((state: RootState) => state.quizInformation.quizInformation);
	const questSession = useSelector(
		(state: any) => state.questSession.questSession
	);

	console.log(questSession, "questSessionquestSessionquestSessionquestSession");


	console.log(response?.quiz, "response?.quiz");
	const [copiedCode, setCopiedCode] = useState(false);
	const [copiedUrl, setCopiedUrl] = useState(false);
	const [origin, setOrigin] = useState('');


	useEffect(() => {
		if (typeof window !== 'undefined') {
			setOrigin(window.location.origin);
		}
	}, []);

	const joinCode = response?.quiz?.join_code;
	const liveurlname = urlnamelive !== undefined && urlnamelive !== null ? urlnamelive : ""
	const fullUrl = `${origin}/attempt/${liveurlname}${questSession?.join_code}?jid=${questSession?.join_link}&qid=${response?.quiz?.id}&sid=${questSession?.id}`;

	console.log(questSession, "participantsNumberparticipantsNumberparticipantsNumber");


	const handleCopy = (text: string, type: 'code' | 'url') => {
		console.log(type, "Invite more participants!");

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


	console.log(participantsNumber, "participantsNumberparticipantsNumber");


	return (
		<div>
			<div className='grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch '>
				<div className="md:col-span-7 bg-white">
					<div className="flex items-center justify-center gap-6 h-full p-6">
						<div className="">
							<RadialBarCharts participantsNumber={participantsNumber} />
						</div>
						<div className="flex flex-col justify-center">
							<h3 className="text-[1.5rem] font-bold text-[#333333]">
								Invite more participants!
							</h3>
							<p>
								Invite by sharing the URL or Quiz Id. Participants can join this MindSpear up until the deadline.
							</p>
						</div>
					</div>
				</div>

				<div className='md:col-span-5 bg-[#fff] '>

					<div className='flex mt-[10px]'>
						<div className='w-full border border-[#2222] rounded-[10px]'>
							<QRCodeGenerator url={fullUrl} />
						</div>
					</div>

					<div className='w-full border border-[#2222] rounded-[10px] flex justify-between mt-[10px] p-[20px]'>
						<div className=''>
							<h5 className=' text-[#7d7d7d]'> Join Code </h5>
							<p className='font-bold text-[#333]'>  {questSession?.join_code} </p>
						</div>
						<div className='flex justify-center items-center'>
							<button
								className="px-6 py-1 text-[14px] font-bold bg-[#ff9f48] text-white rounded hover:bg-[#556fb6]"
								onClick={() => handleCopy(joinCode, 'code')}
							>
								{copiedCode ? 'Copied!' : 'Copy'}
							</button>
						</div>
					</div>

					<div className='w-full border border-[#2222] rounded-[10px] flex justify-between mt-[10px] p-[20px]'>
						<div className=''>
							<h5 className=' text-[#7d7d7d]'> Join Link </h5>
							<p className='font-bold text-[#333]'> {fullUrl.length > 30 ? fullUrl.slice(0, 30) + '...' : fullUrl} </p>
						</div>
						<div className='flex justify-center items-center'>
							<button
								className="px-6 py-1 text-[14px] font-bold bg-[#ff9f48] text-white rounded hover:bg-[#556fb6]"
								onClick={() => handleCopy(fullUrl, 'url')}
							>
								{copiedUrl ? 'Copied!' : 'Copy'}
							</button>
						</div>
					</div>


				</div>
			</div>
		</div>
	)
}

export default Summary
