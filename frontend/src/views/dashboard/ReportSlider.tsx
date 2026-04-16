'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const ReportSlider = () => {
	// Mock data for reports
	const reportsData = [
		{
			id: 1,
			title: 'Quiz',
			participants: 125,
			averageScore: 78,
			completionRate: 85,
		},
		{
			id: 2,
			title: 'Survey',
			participants: 156,
			averageScore: 0, // Surveys don't have scores
			completionRate: 92,
		},
		{
			id: 3,
			title: 'Quest',
			participants: 98,
			averageScore: 82,
			completionRate: 78,
		}
	];

	return (
		<div className="p-6 bg-white dark:bg-[#020d1a]">
			<Swiper
				modules={[Autoplay, Pagination]}
				spaceBetween={30}
				slidesPerView={1}
				autoplay={{
					delay: 3000,
					disableOnInteraction: false,
				}}
				pagination={{ clickable: true }}
				className="max-w-2xl mx-auto !border-0"
			>
				{reportsData.map((report) => (
					<SwiperSlide key={report.id}>
						<div
							className={`flex-[0_1_calc(33.333%_-_30px)] cursor-pointer mb-[30px] overflow-hidden rounded-[28px]`}
						>
							<div className="group relative block overflow-hidden bg-[#f3f3fe] px-5 py-[30px] transition-all duration-300 ease-in-out hover:no-underline">
								{/* Circle background with lower z-index */}
								<div className="absolute top-[-75px] right-[-75px] h-[128px] w-[128px] rounded-full bg-secondary group-hover:scale-[10] transition-transform duration-500 ease-in-out z-0"></div>

								{/* Title */}
								<div className="relative z-10 text-[0.875rem] font-bold text-[#222] group-hover:text-white transition-colors duration-500 ease-in-out text-center">
									{report.title} Reports
								</div>

								{/* Stats */}
								<div className="relative z-20 mt-6 space-y-4">
									<div className="flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow">
										<span className="text-gray-700">Total Participants</span>
										<span className="font-bold text-[#333]">{report.participants}</span>
									</div>

									<div className="flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow">
										<span className="text-gray-700">Average Score</span>
										<span className="font-bold text-[#333]">{report.averageScore > 0 ? `${report.averageScore}%` : 'N/A'}</span>
									</div>

									<div className="flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow">
										<span className="text-gray-700">Completion Rate</span>
										<span className="font-bold text-[#333]">{report.completionRate}%</span>
									</div>
								</div>

								{/* Progress bar */}
								<div className="relative z-20 mt-4">
									<div className="w-full bg-gray-200 rounded-full h-2.5">
										<div
											className="bg-[#f79a46] h-2.5 rounded-full"
											style={{ width: `${report.completionRate}%` }}
										></div>
									</div>
								</div>

								{/* Click Here */}
								<div className="relative z-10 text-[14px] text-[#f79a46] flex items-center justify-center mt-4">
									<span className="pl-1 font-bold text-center group-hover:text-white transition-colors duration-500 ease-in-out">
										View Details
									</span>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default ReportSlider;