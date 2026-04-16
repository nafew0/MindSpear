// components/BillingPage.tsx
'use client';

import { useState } from 'react';
import { Subscription, Invoice, PaymentMethod, BillingOverviewType, } from '@/types/billing';
import { CreditCard, FileText, Calendar, Settings } from 'lucide-react';
import BillingOverview from '@/features/dashboard/web/billing/BillingOverview';
import CurrentPlan from '@/features/dashboard/web/billing/CurrentPlan';
import PaymentMethods from '@/features/dashboard/web/billing/PaymentMethods';
import BillingHistory from '@/features/dashboard/web/billing/BillingHistory';

const BillingPage = () => {
	const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'payment' | 'history'>('overview');

	// Mock data - replace with actual API calls
	const subscription: Subscription = {
		id: 'sub_123',
		plan: 'Pro',
		status: 'active',
		price: 27,
		currency: 'USD',
		interval: 'month',
		currentPeriodStart: new Date('2024-01-01'),
		currentPeriodEnd: new Date('2024-02-01'),
		cancelAtPeriodEnd: false,
	};

	const invoices: Invoice[] = [
		{
			id: 'inv_123',
			amount: 27,
			currency: 'USD',
			date: new Date('2024-01-01'),
			status: 'paid',
			downloadUrl: '#',
		},
		{
			id: 'inv_122',
			amount: 27,
			currency: 'USD',
			date: new Date('2023-12-01'),
			status: 'paid',
			downloadUrl: '#',
		},
	];

	const paymentMethods: PaymentMethod[] = [
		{
			id: 'pm_123',
			type: 'card',
			card: {
				brand: 'visa',
				last4: '4242',
				expMonth: 12,
				expYear: 2025,
			},
			isDefault: true,
		},
	];

	const billingOverview: BillingOverviewType = {
		nextBillingDate: new Date('2024-02-01'),
		nextBillingAmount: 27,
		usage: {
			participants: 1500,
			presentations: 45,
			storage: 2.5,
		},
	};

	const tabs = [
		{ id: 'overview' as const, label: 'Overview', icon: Calendar },
		{ id: 'plan' as const, label: 'Plan & Billing', icon: Settings },
		{ id: 'payment' as const, label: 'Payment Methods', icon: CreditCard },
		{ id: 'history' as const, label: 'Billing History', icon: FileText },
	];

	return (
		<div className="min-h-screen py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
					<p className="text-gray-600 mt-2">Manage your subscription and payment methods</p>
				</div>

				{/* Navigation Tabs */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
					<nav className="flex overflow-x-auto">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700'
										}`}
								>
									<Icon className="w-4 h-4" />
									{tab.label}
								</button>
							);
						})}
					</nav>
				</div>

				{/* Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2">
						{activeTab === 'overview' && (
							<BillingOverview data={billingOverview} subscription={subscription} />
						)}
						{activeTab === 'plan' && (
							<CurrentPlan subscription={subscription} />
						)}
						{activeTab === 'payment' && (
							<PaymentMethods methods={paymentMethods} />
						)}
						{activeTab === 'history' && (
							<BillingHistory invoices={invoices} />
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Quick Actions */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
							<div className="space-y-3">
								<button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
									Download invoice
								</button>
								<button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
									Update payment method
								</button>
								<button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
									Cancel subscription
								</button>
							</div>
						</div>

						{/* Support Card */}
						<div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
							<h3 className="font-semibold text-blue-900 mb-2">Need help?</h3>
							<p className="text-blue-800 text-sm mb-4">
								Our support team is here to help with any billing questions.
							</p>
							<button className="w-full bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary transition-colors">
								Contact Support
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BillingPage;