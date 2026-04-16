export interface Subscription {
	id: string;
	plan: string;
	status: "active" | "canceled" | "past_due" | "trialing";
	price: number;
	currency: string;
	interval: "month" | "year";
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	cancelAtPeriodEnd: boolean;
}

export interface Invoice {
	id: string;
	amount: number;
	currency: string;
	date: Date;
	status: "paid" | "pending" | "failed";
	downloadUrl: string;
}

export interface PaymentMethod {
	id: string;
	type: "card" | "paypal" | "bank_transfer";
	card?: {
		brand: string;
		last4: string;
		expMonth: number;
		expYear: number;
	};
	isDefault: boolean;
}

export interface BillingOverviewType {
	nextBillingDate: Date;
	nextBillingAmount: number;
	usage: {
		participants: number;
		presentations: number;
		storage: number;
	};
}
