// components/billing/PaymentMethods.tsx
import { PaymentMethod } from '@/types/billing';
import { CreditCard, Plus, Edit, Trash2 } from 'lucide-react';

interface PaymentMethodsProps {
	methods: PaymentMethod[];
}

const PaymentMethods = ({ methods }: PaymentMethodsProps) => {


	return (
		<div className="space-y-6">
			{/* Current Payment Methods */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
					<button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors">
						<Plus className="w-4 h-4" />
						Add Payment Method
					</button>
				</div>

				<div className="space-y-4">
					{methods.map((method) => (
						<div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
							<div className="flex items-center gap-4">
								<div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
									<CreditCard className="w-5 h-5 text-gray-600" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-gray-900 capitalize">
											{method.card?.brand} •••• {method.card?.last4}
										</span>
										{method.isDefault && (
											<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
												Default
											</span>
										)}
									</div>
									<p className="text-gray-600 text-sm">
										Expires {method.card?.expMonth}/{method.card?.expYear}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{!method.isDefault && (
									<button className="text-gray-400 hover:text-gray-600 transition-colors">
										<Trash2 className="w-4 h-4" />
									</button>
								)}
								<button className="text-gray-400 hover:text-gray-600 transition-colors">
									<Edit className="w-4 h-4" />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Billing Information */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<p className="text-gray-900">john.doe@example.com</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
						<p className="text-gray-900">Not provided</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PaymentMethods;