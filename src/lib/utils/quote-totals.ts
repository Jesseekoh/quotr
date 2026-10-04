import type { QuoteItem, QuoteSection } from '#lib/api/types.js';

export function itemTotal(item: QuoteItem): number {
	return Number(item.totalPrice);
}

export function sectionSubtotal(section: Pick<QuoteSection, 'items'>): number {
	return section.items.reduce((total, item) => total + itemTotal(item), 0);
}

export function ungroupedSubtotal(quote: { items?: QuoteItem[] }): number {
	return (quote.items ?? [])
		.filter((item) => item.quoteSectionId === null && item.quoteOptionId === null)
		.reduce((total, item) => total + itemTotal(item), 0);
}

export function quoteSubtotal(quote: { items?: QuoteItem[]; sections?: QuoteSection[] }): number {
	return (
		ungroupedSubtotal(quote) +
		(quote.sections ?? []).reduce((total, section) => total + sectionSubtotal(section), 0)
	);
}
