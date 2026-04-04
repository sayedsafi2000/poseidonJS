export type ProductCardPricing = {
  displayPrice: number;
  compareAtPrice: number | null;
  percentOff: number | null;
  priceLabelPrefix: string;
};

const n = (x: unknown): number => {
  if (typeof x === 'number' && !Number.isNaN(x)) return x;
  const p = parseFloat(String(x));
  return Number.isFinite(p) ? p : 0;
};

/** True when sale/list price implies a real discount (root or any variant). */
export function productHasDiscount(product: unknown): boolean {
  const p = product as Record<string, unknown> | null | undefined;
  if (!p) return false;
  const { percentOff } = getProductCardPricing(p);
  return percentOff != null && percentOff > 0;
}

export function getProductCardPricing(product: Record<string, unknown>): ProductCardPricing {
  if (product?.hasVariants && Array.isArray(product.variants) && product.variants.length > 0) {
    let minCurrent = Infinity;
    let maxPercentOff = 0;
    for (const raw of product.variants as Record<string, unknown>[]) {
      const op = n(raw?.price);
      if (op <= 0) continue;
      let current = op;
      if (raw?.salePrice != null && raw.salePrice !== '') {
        const sp = n(raw.salePrice);
        if (sp < op) {
          current = sp;
          maxPercentOff = Math.max(maxPercentOff, Math.round(((op - sp) / op) * 100));
        }
      }
      if (current < minCurrent) minCurrent = current;
    }
    const basePrice = n(product.price);
    if (!Number.isFinite(minCurrent) || minCurrent === Infinity) minCurrent = basePrice;
    const hasDiscount = maxPercentOff > 0;
    return {
      displayPrice: minCurrent,
      compareAtPrice: null,
      percentOff: hasDiscount ? maxPercentOff : null,
      priceLabelPrefix: (product.variants as unknown[]).length > 1 ? 'From ' : '',
    };
  }

  const price = n(product.price);
  const saleRaw = product.salePrice;
  const sale =
    saleRaw != null && saleRaw !== '' ? n(saleRaw) : null;
  const hasDiscount = sale != null && price > 0 && sale < price;
  return {
    displayPrice: hasDiscount ? sale! : price,
    compareAtPrice: hasDiscount ? price : null,
    percentOff: hasDiscount ? Math.round(((price - sale!) / price) * 100) : null,
    priceLabelPrefix: '',
  };
}

export function getProductCartUnitPrice(product: Record<string, unknown>): number {
  const { displayPrice } = getProductCardPricing(product);
  return displayPrice;
}
