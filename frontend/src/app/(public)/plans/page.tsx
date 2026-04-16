// components/PlanPage.tsx
'use client';

import { PlanSection, } from '@/types/plan';
import PlanCard from '@/views/web/plans/PlanCard';
import PlanComparison from '@/views/web/plans/PlanComparison';


const PlanPage = () => {
	const planSections: PlanSection[] = [
		{
			title: 'Plans that get people talking.',
			description: 'Individuals and business - Teachers or students',
			plans: [
				{
					id: 'free',
					name: 'Free',
					tagline: 'Easiest way to try MindSpear.',
					price: '0',
					currency: 'USD',
					billingInfo: '',
					isCurrent: true,
					features: [
						{
							title: '50 participants per month',
							description: 'Unlimited participants once per month'
						},
						{
							title: 'Multiple question types',
							description: 'Word Clouds, Polis, Quizzes, & more'
						},
						{
							title: 'Improve with insights',
							description: 'Dive into results and feedback from your session'
						}
					]
				},
				{
					id: 'basic',
					name: 'Basic',
					tagline: 'Unlimited engagement for individuals',
					price: '13',
					currency: 'USD',
					billingInfo: 'Per presenter/month • Billed yearly, excl. tax.',
					ctaText: 'Upgrade to Basic',
					features: [
						{
							title: 'Unlimited participants',
							description: 'Present to however many people you like - with no monthly restrictions'
						},
						{
							title: 'Import existing slides',
							description: 'Upload PowerPoint, Keynote or PDF files, then add interactive questions'
						},
						{
							title: 'Export your results',
							description: 'Download and share your results in Excel or PDF format'
						}
					]
				},
				{
					id: 'pro',
					name: 'Pro',
					tagline: 'Powerful tools for growing teams.',
					price: '27',
					currency: 'USD',
					billingInfo: 'Per presenter/month • Billed yearly, excl. tax.',
					isRecommended: true,
					ctaText: 'Upgrade to Pro',
					features: [
						{
							title: 'More design capabilities',
							description: 'Match your brand or own preferences'
						},
						{
							title: 'Workspace collaboration',
							description: 'Share Mentis, themes and templates with your team'
						},
						{
							title: 'Co-create your slides',
							description: 'Edit and present Mentis together'
						},
						{
							title: 'More control in the live moment',
							description: 'Use your phone to control the Menti you\'re presenting. Flip through slides, check live results and moderate Q&As'
						}
					]
				},
				{
					id: 'enterprise',
					name: 'Enterprise',
					tagline: 'Customized for larger organizations.',
					price: 'Custom',
					currency: '',
					billingInfo: '',
					ctaText: 'Learn more',
					features: [
						{
							title: 'Single Sign-On (SSO)',
							description: 'Authenticate logins with your IDP'
						},
						{
							title: 'Verify participants',
							description: 'Ask participants to log in before joining'
						},
						{
							title: 'SCIM',
							description: 'Automate license and role management'
						},
						{
							title: 'Tailored onboarding',
							description: 'Custom guidance and support'
						},
						{
							title: 'Workspace insights',
							description: 'Learn how Mentimeter is used in your organization'
						}
					]
				}
			]
		}
	];

	const allFeatures = {
		basic: [
			'50 participants per month',
			'Unlimited participants once per month',
			'Multiple question types',
			'Improve with insights',
			'Unlimited participants',
			'Import existing slides',
			'Export your results'
		],
		pro: [
			'More design capabilities',
			'Workspace collaboration',
			'Co-create your slides',
			'More control in the live moment'
		],
		enterprise: [
			'Single Sign-On (SSO)',
			'Verify participants',
			'SCIM',
			'Tailored onboarding',
			'Workspace insights'
		]
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="text-center mb-16">
					<h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl mb-4">
						Plans that get people talking.
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Individuals and business • Teachers or students
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					{planSections[0].plans.map((plan) => (
						<PlanCard key={plan.id} plan={plan} />
					))}
				</div>

				{/* Feature Comparison */}
				<PlanComparison features={allFeatures} />
			</div>
		</div>
	);
};

export default PlanPage;