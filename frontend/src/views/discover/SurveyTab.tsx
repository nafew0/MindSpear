'use client';

import { useState, useEffect } from 'react';
import DiscoverCard, { CardItem } from '@/views/discover/DiscoverCard';
import axiosInstance from '@/utils/axiosInstance';
import GlobalPagination from '@/components/GlobalPagination';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface Survey {
	id: number;
	title: string;
	description: string | null;
	is_published: boolean;
	participants_count?: number;
	duration?: string;
	category?: string;
	rating?: number;
	created_at: string;
}

interface SurveyApiResponse {
	status: boolean;
	message: string;
	data: {
		surveys: {
			data: Survey[];
			current_page: number;
			last_page: number;
			per_page: number;
			total: number;
		};
	};
}

export default function SurveyTab() {
	const [surveys, setSurveys] = useState<CardItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(8);

	const fetchSurveys = async () => {
		try {
			setLoading(true);
			const response = await axiosInstance.get<SurveyApiResponse>(`/surveys-public?page=${currentPage}&per_page=${itemsPerPage}`);

			if (response.data.status) {
				const surveyData = response.data.data.surveys;
				const surveysList = surveyData.data || [];

				const transformedSurveys: CardItem[] = surveysList.map((survey: Survey) => {
					const createdDate = new Date(survey.created_at);
					const now = new Date();
					const diffTime = Math.abs(now.getTime() - createdDate.getTime());
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

					let lastUpdated = '';
					if (diffDays === 1) {
						lastUpdated = '1 day ago';
					} else if (diffDays < 7) {
						lastUpdated = `${diffDays} days ago`;
					} else if (diffDays < 30) {
						const weeks = Math.floor(diffDays / 7);
						lastUpdated = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
					} else {
						lastUpdated = createdDate.toLocaleDateString();
					}

					return {
						id: survey.id.toString(),
						title: survey.title,
						description: survey.description || 'Share your opinions and help with research',
						participants: survey.participants_count || Math.floor(Math.random() * 500) + 50,
						difficulty: 'Easy' as const,
						duration: survey.duration || `${Math.floor(Math.random() * 15) + 5} min`,
						category: survey.category || ['Business', 'Health', 'Lifestyle', 'Technology'][Math.floor(Math.random() * 4)],
						rating: survey.rating || Math.round((Math.random() * 2 + 3) * 10) / 10,
						featured: Math.random() > 0.8,
						downloads: Math.floor(Math.random() * 5000) + 100,
						views: Math.floor(Math.random() * 10000) + 500,
						author: 'Survey Creator',
						lastUpdated: lastUpdated,
						type: 'Survey' as const
					};
				});

				setSurveys(transformedSurveys);
				setTotalItems(surveyData.total || 0);
			}
		} catch (error) {
			console.error('Error fetching surveys:', error);
			setSurveys([]);
			setTotalItems(0);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSurveys();
	}, [currentPage, itemsPerPage]);

	const handlePageChange = (page: number, pageSize?: number) => {
		const newSize = Number(pageSize);

		if (newSize && newSize !== itemsPerPage) {
			setItemsPerPage(newSize);
			setCurrentPage(1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			setCurrentPage(page);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleCardClick = (item: CardItem) => {
		console.log('Survey clicked:', item);
	};

	const handleImportTemplate = (item: CardItem) => {
		toast.error(`Importing "${item.title}" to your library...`);
	};

	const handlePreviewTemplate = (item: CardItem) => {
		toast.error(`Opening preview for "${item.title}"...`);
	};

	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 auto-rows-fr">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="bg-white rounded-2xl border border-gray-200 animate-pulse h-full">
						<div className="h-32 bg-gray-200 rounded-t-2xl"></div>
						<div className="p-5 space-y-3">
							<div className="h-4 bg-gray-200 rounded"></div>
							<div className="h-4 bg-gray-200 rounded w-2/3"></div>
							<div className="h-10 bg-gray-200 rounded"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<>
			{totalItems > 0 && (
				<div className="mb-6 text-sm text-gray-600">
					Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
					{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} surveys
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 auto-rows-fr">
				{surveys.map((item) => (
					<DiscoverCard
						key={item.id}
						item={item}
						onClick={() => handleCardClick(item)}
						onImport={handleImportTemplate}
						onPreview={handlePreviewTemplate}
					/>
				))}
			</div>

			{totalItems > 0 && (
				<div className="mt-6">
					<GlobalPagination
						current={currentPage}
						total={totalItems}
						pageSize={itemsPerPage}
						onChange={handlePageChange}
					/>
				</div>
			)}

			{surveys.length === 0 && !loading && (
				<div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
					<div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
						<Image
							src="/images/icons/survey.svg"
							alt="No Surveys"
							width={48}
							height={48}
							className="text-gray-400"
						/>
					</div>
					<h3 className="text-2xl font-bold text-gray-900 mb-3">No surveys available</h3>
					<p className="text-gray-600 max-w-md mx-auto">
						{`We're working on bringing you amazing survey content. Check back soon!`}
					</p>
				</div>
			)}
		</>
	);
}