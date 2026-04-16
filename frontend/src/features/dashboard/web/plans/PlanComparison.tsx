// components/PlanComparison.tsx
'use client';

import { Check } from 'lucide-react';

interface PlanComparisonProps {
	features: {
		basic: string[];
		pro: string[];
		enterprise: string[];
	};
}

const PlanComparison = ({ features }: PlanComparisonProps) => {
	const allFeatures = [
		...features.basic,
		...features.pro,
		...features.enterprise
	].filter((feature, index, self) => self.indexOf(feature) === index);

	const getFeatureAvailability = (feature: string) => ({
		basic: features.basic.includes(feature),
		pro: features.pro.includes(feature) || features.basic.includes(feature),
		enterprise: features.enterprise.includes(feature) ||
			features.pro.includes(feature) ||
			features.basic.includes(feature)
	});

	return (
		<div className="bg-white rounded-2xl p-8">
			<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
				Plan Comparison
			</h2>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b-2 border-gray-200">
							<th className="text-left py-4 px-4 font-semibold text-gray-900">
								Features
							</th>
							<th className="text-center py-4 px-4 font-semibold text-gray-900">
								Basic
							</th>
							<th className="text-center py-4 px-4 font-semibold text-blue-600">
								Pro
							</th>
							<th className="text-center py-4 px-4 font-semibold text-gray-900">
								Enterprise
							</th>
						</tr>
					</thead>
					<tbody>
						{allFeatures.map((feature, index) => {
							const availability = getFeatureAvailability(feature);
							return (
								<tr key={feature} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
									<td className="py-4 px-4 font-medium text-gray-900">
										{feature}
									</td>
									<td className="text-center py-4 px-4">
										{availability.basic ? (
											<Check className="w-6 h-6 text-green-500 mx-auto" />
										) : (
											<span className="text-gray-400">—</span>
										)}
									</td>
									<td className="text-center py-4 px-4">
										{availability.pro ? (
											<Check className="w-6 h-6 text-green-500 mx-auto" />
										) : (
											<span className="text-gray-400">—</span>
										)}
									</td>
									<td className="text-center py-4 px-4">
										{availability.enterprise ? (
											<Check className="w-6 h-6 text-green-500 mx-auto" />
										) : (
											<span className="text-gray-400">—</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default PlanComparison;