'use client';

import { Clock, Download, Star, Eye, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface CardItem {
	id: string;
	title: string;
	description: string;
	participants: number;
	difficulty: 'Easy' | 'Medium' | 'Hard';
	duration: string;
	category?: string;
	rating?: number;
	featured?: boolean;
	downloads?: number;
	views?: number;
	tags?: string[];
	author?: string;
	lastUpdated?: string;
	compatibility?: string[];
	type?: 'Quiz' | 'Survey' | 'Quest';
}

interface DiscoverCardProps {
	item: CardItem;
	onClick?: () => void;
	onImport?: (item: CardItem) => void;
	onPreview?: (item: CardItem) => void;
}

export default function DiscoverCard({ item, onClick, onPreview }: DiscoverCardProps) {
	const getTypeIcon = (type?: string) => {
		switch (type) {
			case 'Quiz':
				return '/images/icons/quiz.svg';
			case 'Survey':
				return '/images/icons/survey.svg';
			case 'Quest':
				return '/images/icons/quest.svg';
			default:
				return '/images/icons/quest.svg';
		}
	};

	const getRoutePath = (type?: string, id?: string) => {
		if (!type || !id) return '#';

		switch (type.toLowerCase()) {
			case 'quiz':
				return `/templates/quiz/${id}`;
			case 'survey':
				return `/templates/survey/${id}`;
			case 'quest':
				return `/templates/quest/${id}`;
			default:
				return `/templates/${type?.toLowerCase()}/${id}`;
		}
	};

	const handlePreview = (e: React.MouseEvent) => {
		e.stopPropagation();
		onPreview?.(item);
	};

	const routePath = getRoutePath(item.type, item.id);

	return (
		<Link href={routePath} className="block">
			<div
				className="group relative bg-white rounded-2xl border border-gray-200 hover:border-primary/30 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
				onClick={onClick}
			>
				{/* Header with Icon - Fixed Height */}
				<div className="relative h-32 bg-gray-50 p-4 flex-shrink-0 flex items-center justify-center">
					{/* Type Icon */}
					<div className="flex items-center justify-center w-full h-full">
						<Image
							className="m-auto"
							src={getTypeIcon(item.type)}
							width={80}
							height={80}
							alt={`${item.type} icon`}
						/>
					</div>

					{/* Featured Badge */}
					{/* {item.featured && (
						<div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
							⭐ Featured
						</div>
					)} */}

					{/* Quick Actions Overlay */}
					<div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
						<button
							onClick={handlePreview}
							className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors duration-200"
							title="Preview Template"
						>
							<Eye className="w-4 h-4 text-gray-700" />
						</button>
					</div>
				</div>

				{/* Card Content - Flexible Height */}
				<div className="p-5 flex flex-col flex-1">
					{/* Title */}
					<div className="flex items-start justify-between mb-3 flex-shrink-0">
						<h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-2 group-hover:text-primary transition-colors">
							{item.title}
						</h3>
					</div>

					{/* Description - Flexible Space */}
					<p className="text-gray-600 text-sm line-clamp-2 leading-relaxed flex-1 mb-3">
						{item.description}
					</p>

					{/* Creator Info - Below Description */}
					{item.author && (
						<div className="flex items-center gap-2 text-sm text-gray-500 mb-3 flex-shrink-0">
							<User className="w-4 h-4 text-gray-400" />
							<span className="font-medium">Creator:</span>
							<span className="text-gray-700">{item.author}</span>
						</div>
					)}

					{/* Tags */}
					{item.tags && item.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mb-3 flex-shrink-0">
							{item.tags.slice(0, 3).map((tag, index) => (
								<span
									key={index}
									className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
								>
									{tag}
								</span>
							))}
							{item.tags.length > 3 && (
								<span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
									+{item.tags.length - 3}
								</span>
							)}
						</div>
					)}

					{/* Stats - Enhanced with template metrics */}
					<div className="flex items-center justify-between text-sm text-gray-500 flex-shrink-0">
						<div className="flex items-center space-x-4">
							<span className="flex items-center gap-1" title="Total Downloads">
								<Download className="w-4 h-4" />
								{item.downloads?.toLocaleString() || item.participants.toLocaleString()}
							</span>
							<span className="flex items-center gap-1" title="Duration">
								<Clock className="w-4 h-4" />
								{item.duration}
							</span>
						</div>

						{/* Rating */}
						{item.rating && (
							<div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
								<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
								<span className="text-xs font-bold text-yellow-700">{item.rating}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}