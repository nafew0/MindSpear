// types/plan.ts
export interface PlanFeature {
	title: string;
	description: string;
}

export interface PricingPlan {
	id: string;
	name: string;
	tagline: string;
	price: string;
	billingInfo: string;
	currency: string;
	isCurrent?: boolean;
	isRecommended?: boolean;
	features: PlanFeature[];
	ctaText?: string;
	highlight?: boolean;
}

export interface PlanSection {
	title: string;
	description: string;
	plans: PricingPlan[];
}
