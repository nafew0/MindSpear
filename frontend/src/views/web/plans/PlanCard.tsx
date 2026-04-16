// components/PlanCard.tsx
'use client';

import { PricingPlan } from '@/types/plan';
import { Check, Star } from 'lucide-react';

interface PlanCardProps {
	plan: PricingPlan;
}

const PlanCard = ({ plan }: PlanCardProps) => {
	return (
		<div
			className={`relative rounded-2xl p-8 bg-white  transition-all duration-300 ${plan.highlight ? 'ring-2 ring-orange-500 ring-offset-2' : ''
				} ${plan.isRecommended ? 'border-2 border-orange-500 transform scale-105' : 'border border-gray-200'}`}
		>
			{/* Recommended Badge */}
			{plan.isRecommended && (
				<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
					<div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
						<Star className="w-4 h-4" />
						Recommended
					</div>
				</div>
			)}

			{/* Current Plan Badge */}
			{plan.isCurrent && (
				<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
					<div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
						Current Plan
					</div>
				</div>
			)}

			{/* Plan Header */}
			<div className="text-center mb-8">
				<h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
				<p className="text-gray-600 text-sm mb-4">{plan.tagline}</p>

				{/* Price */}
				<div className="mb-2">
					{plan.price === '0' ? (
						<span className="text-4xl font-bold text-gray-900">Free</span>
					) : plan.price === 'Custom' ? (
						<span className="text-4xl font-bold text-gray-900">Custom</span>
					) : (
						<div>
							<span className="text-4xl font-bold text-gray-900">${plan.price}</span>
							<span className="text-gray-600 ml-1">{plan.currency}</span>
						</div>
					)}
				</div>

				{plan.billingInfo && (
					<p className="text-gray-500 text-sm">{plan.billingInfo}</p>
				)}
			</div>

			{/* CTA Button */}
			{plan.ctaText && (
				<button
					className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 mb-6 ${plan.isRecommended
						? 'bg-orange-500 hover:bg-orange-600 text-white'
						: 'bg-gray-100 hover:bg-gray-200 text-gray-900'
						}`}
				>
					{plan.ctaText}
				</button>
			)}

			{/* Features List */}
			<ul className="space-y-4">
				{plan.features.map((feature, index) => (
					<li key={index} className="flex items-start gap-3">
						<Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
						<div>
							<span className="font-medium text-gray-900">{feature.title}</span>
							{feature.description && (
								<p className="text-gray-600 text-sm mt-1">{feature.description}</p>
							)}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default PlanCard;