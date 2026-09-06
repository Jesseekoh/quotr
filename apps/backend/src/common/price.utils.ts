import { Decimal } from '@prisma/client/runtime/client';
import { PriceLabel } from '../generated/prisma/enums.js';

type PricedProduct = {
  costPrice: Decimal;
  discountPrice: Decimal;
  resalePrice: Decimal;
  specialPrice: Decimal;
  enduserPrice: Decimal;
};

/**
 * Given a product and a quote's price label (e.g. "special price"), return
 * the corresponding price field on the product.
 */
export function getProductPriceForLabel(
  product: PricedProduct,
  label: PriceLabel,
): Decimal {
  switch (label) {
    case PriceLabel.COST_PRICE:
      return product.costPrice;
    case PriceLabel.DISCOUNT_PRICE:
      return product.discountPrice;
    case PriceLabel.RESALE_PRICE:
      return product.resalePrice;
    case PriceLabel.SPECIAL_PRICE:
      return product.specialPrice;
    case PriceLabel.ENDUSER_PRICE:
      return product.enduserPrice;
    default:
      return product.enduserPrice;
  }
}
