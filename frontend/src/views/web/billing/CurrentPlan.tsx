// components/billing/CurrentPlan.tsx
import { Subscription } from '@/types/billing';
import { RefreshCw, X } from 'lucide-react';

interface CurrentPlanProps {
	subscription: Subscription;
}

const CurrentPlan = ({ subscription }: CurrentPlanProps) => {
	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	return (
		<div className="space-y-6">
			{/* Plan Details */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600">Plan</span>
							<span className="font-semibold text-gray-900">{subscription.plan}</span>
						</div>
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600">Status</span>
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.status === 'active'
								? 'bg-green-100 text-green-800'
								: 'bg-red-100 text-red-800'
								}`}>
								{subscription.status.replace('_', ' ')}
							</span>
						</div>
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600">Billing Cycle</span>
							<span className="font-semibold text-gray-900 capitalize">
								{subscription.interval}ly
							</span>
						</div>
					</div>

					<div>
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600">Price</span>
							<span className="font-semibold text-gray-900">
								${subscription.price}/{subscription.interval}
							</span>
						</div>
						<div className="flex justify-between items-center py-3 border-b border-gray-100">
							<span className="text-gray-600">Current Period</span>
							<span className="font-semibold text-gray-900">
								{formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
							</span>
						</div>
						<div className="flex justify-between items-center py-3">
							<span className="text-gray-600">Auto-renewal</span>
							<span className={`font-semibold ${subscription.cancelAtPeriodEnd ? 'text-red-600' : 'text-green-600'
								}`}>
								{subscription.cancelAtPeriodEnd ? 'Disabled' : 'Enabled'}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Actions</h3>
				<div className="flex flex-wrap gap-4">
					<button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors">
						<RefreshCw className="w-4 h-4" />
						Change Plan
					</button>

					{subscription.cancelAtPeriodEnd ? (
						<button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
							<RefreshCw className="w-4 h-4" />
							Resume Subscription
						</button>
					) : (
						<button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
							<X className="w-4 h-4" />
							Cancel Subscription
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default CurrentPlan;