
export const getMarkupPercentage = () => {
  return 0.2;
};

export const priceWithMarkup = (
  basePrice: number,
  role: string | undefined
): number => {
  if (role !== "buyer") return basePrice;

  const markup = getMarkupPercentage();
  const priceWithMarkup = basePrice + basePrice * markup;

  return parseFloat(priceWithMarkup.toFixed(2)); 
};
