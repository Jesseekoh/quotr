export type ProductCategory =
	| 'SOLAR_PANEL'
	| 'INVERTER'
	| 'CHARGE_CONTROLLER'
	| 'BATTERY'
	| 'RACK_MOUNTING'
	| 'CABLE'
	| 'CABINET'
	| 'ACCESSORY'
	| 'OTHER';

export type PriceLabel =
	// | 'COST_PRICE'
	'DISCOUNT_PRICE' | 'RESALE_PRICE' | 'SPECIAL_PRICE' | 'ENDUSER_PRICE';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

// Prisma Decimal fields are serialized to strings over JSON.
export interface Product {
	id: string;
	name: string;
	brand: string;
	category: ProductCategory;
	specification: string;
	warranty: string;
	technicalSpecs: Record<string, unknown> | null;
	unit: string | null;
	costPrice: string;
	discountPrice: string;
	resalePrice: string;
	specialPrice: string;
	enduserPrice: string;
	createdAt: string;
	updatedAt: string;
}

export interface Customer {
	id: string;
	name: string;
	phone: string | null;
	email: string | null;
	address: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface QuoteItem {
	id: string;
	quoteId: string;
	quoteOptionId: string | null;
	quoteSectionId: string | null;
	productId: string | null;
	description: string;
	brand: string | null;
	specification: string | null;
	category: ProductCategory | null;
	quantity: number;
	unit: string | null;
	unitPrice: string;
	totalPrice: string;
	sortOrder: number;
}

export interface QuoteOption {
	id: string;
	quoteId: string;
	quoteSectionId: string | null;
	name: string;
	description: string | null;
	isDefault: boolean;
	sortOrder: number;
}

// What GET /quotes/:id actually returns: each option carries its own items
// plus totals computed server-side.
export interface QuoteOptionWithTotals extends QuoteOption {
	items: QuoteItem[];
	optionItemsTotal: number;
	grandTotal: number;
}

export interface QuoteSection {
	id: string;
	quoteId: string;
	name: string;
	sortOrder: number;
	items: QuoteItem[];
	options: QuoteOptionWithItems[];
}

export interface QuoteOptionWithItems extends QuoteOption {
	items: QuoteItem[];
}

export interface QuoteSummary {
	commonItemsTotal: number;
	minTotal: number;
	maxTotal: number;
}

export interface QuoteDetail {
	id: string;
	quoteNumber: string;
	customerId: string;
	customer: Customer;
	label: PriceLabel;
	status: QuoteStatus;
	loadProfileTotal: string | null;
	loadProfileNotes: string | null;
	paymentTerms: string | null;
	notes: string | null;
	// Items with no quoteOptionId - apply to every option.
	items: QuoteItem[];
	options: QuoteOptionWithTotals[];
	quoteSections: QuoteSection[];
	summary: QuoteSummary;
	createdAt: string;
	updatedAt: string;
}
