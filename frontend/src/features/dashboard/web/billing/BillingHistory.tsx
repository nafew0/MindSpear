
import { Invoice } from '@/types/billing';
import { Download, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface BillingHistoryProps {
	invoices: Invoice[];
}

const BillingHistory = ({ invoices }: BillingHistoryProps) => {
	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const formatAmount = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'paid':
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case 'pending':
				return <Clock className="w-4 h-4 text-yellow-500" />;
			case 'failed':
				return <XCircle className="w-4 h-4 text-red-500" />;
			default:
				return <FileText className="w-4 h-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'paid':
				return 'text-green-800 bg-green-100';
			case 'pending':
				return 'text-yellow-800 bg-yellow-100';
			case 'failed':
				return 'text-red-800 bg-red-100';
			default:
				return 'text-gray-800 bg-gray-100';
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
			<div className="px-6 py-4 border-b border-gray-200">
				<h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
			</div>

			<div className="divide-y divide-gray-200">
				{invoices.map((invoice) => (
					<div key={invoice.id} className="px-6 py-4 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
								<FileText className="w-5 h-5 text-gray-600" />
							</div>

							<div>
								<div className="flex items-center gap-2 mb-1">
									{getStatusIcon(invoice.status)}
									<span className="font-medium text-gray-900">
										Invoice #{invoice.id.slice(-8).toUpperCase()}
									</span>
								</div>
								<p className="text-gray-600 text-sm">{formatDate(invoice.date)}</p>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<span className="font-semibold text-gray-900">
								{formatAmount(invoice.amount, invoice.currency)}
							</span>

							<span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
								{invoice.status}
							</span>

							<button
								className="text-gray-400 hover:text-gray-600 transition-colors"
								title="Download Invoice"
							>
								<Download className="w-4 h-4" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default BillingHistory;