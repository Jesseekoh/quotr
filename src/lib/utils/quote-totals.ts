import type { QuoteItem, QuoteOptionWithItems, QuoteSection } from '#lib/api/types.js';

export type SectionRange = { min: number; max: number };
export type PricingCombination = { label: string; total: number };
export type QuoteTotals = {
	fixedTotal: number;
	combinations: PricingCombination[];
	combinationCount: number;
	overallMin: number;
	overallMax: number;
	truncated: boolean;
};

type QuoteTotalsInput = { items?: QuoteItem[]; sections?: QuoteSection[] };
const MAX_COMBINATIONS = 2000;
export const MAX_RENDERED_COMBINATIONS = 50;

export function lineTotal(item: Pick<QuoteItem, 'totalPrice' | 'quantity' | 'unitPrice'>): number {
	return Number(item.quantity) * Number(item.unitPrice);
}

export function optionTotal(option: Pick<QuoteOptionWithItems, 'items'>): number {
	return option.items.reduce((total, item) => total + lineTotal(item), 0);
}

export function baseTotal(section: Pick<QuoteSection, 'items'>): number {
	return section.items
		.filter((item) => item.quoteOptionId === null)
		.reduce((total, item) => total + lineTotal(item), 0);
}

export function sectionTotalForOption(
	section: Pick<QuoteSection, 'items'>,
	option: Pick<QuoteOptionWithItems, 'items'>
): number {
	return baseTotal(section) + optionTotal(option);
}

export function sectionRange(section: Pick<QuoteSection, 'items' | 'options'>): SectionRange {
	const base = baseTotal(section);
	if (section.options.length === 0) return { min: base, max: base };
	const totals = section.options.map((option) => base + optionTotal(option));
	return { min: Math.min(...totals), max: Math.max(...totals) };
}

export function ungroupedTotal(quote: Pick<QuoteTotalsInput, 'items'>): number {
	return (quote.items ?? [])
		.filter((item) => item.quoteSectionId === null)
		.reduce((total, item) => total + lineTotal(item), 0);
}

function optionLabel(option: QuoteOptionWithItems, index: number): string {
	return option.name.trim() || `Opt ${String.fromCharCode(65 + index)}`;
}

export function quoteTotals(quote: QuoteTotalsInput): QuoteTotals {
	const sections = quote.sections ?? [];
	const variableSections = sections.filter((section) => section.options.length >= 2);
	const fixedTotal =
		ungroupedTotal(quote) +
		sections
			.filter((section) => section.options.length < 2)
			.reduce((total, section) => total + sectionRange(section).min, 0);
	const combinationCount = variableSections.reduce(
		(total, section) => total * section.options.length,
		1
	);

	if (variableSections.length === 0) {
		return {
			fixedTotal,
			combinations: [{ label: '', total: fixedTotal }],
			combinationCount: 1,
			overallMin: fixedTotal,
			overallMax: fixedTotal,
			truncated: false
		};
	}

	const ranges = variableSections.map((section) => sectionRange(section));
	const combinations: PricingCombination[] = [];
	function visit(sectionIndex: number, selected: string[], total: number) {
		if (combinations.length >= MAX_COMBINATIONS) return;
		const section = variableSections[sectionIndex];
		if (!section) {
			combinations.push({ label: selected.join(' + '), total });
			return;
		}
		section.options.forEach((option, optionIndex) =>
			visit(
				sectionIndex + 1,
				[...selected, `${section.name} ${optionLabel(option, optionIndex)}`],
				total + sectionTotalForOption(section, option)
			)
		);
	}
	visit(0, [], fixedTotal);

	return {
		fixedTotal,
		combinations,
		combinationCount,
		overallMin: fixedTotal + ranges.reduce((total, range) => total + range.min, 0),
		overallMax: fixedTotal + ranges.reduce((total, range) => total + range.max, 0),
		truncated: combinationCount > MAX_COMBINATIONS
	};
}
