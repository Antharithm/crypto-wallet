import { formatUnits } from "ethers";

export const formatWeiAmount = (amount, decimals) => {
  amount = formatUnits(amount, decimals);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(amount);
};
