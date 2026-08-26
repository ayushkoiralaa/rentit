import { env } from "../config/env.js";

// The client NEVER supplies totals. Every rupee shown in a booking is
// calculated here, on the server, from the item's stored price.
export function calculateRentalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / msPerDay);
}

export function calculateBookingPrice({ pricePerDay, startDate, endDate, securityDeposit = 0 }) {
  const numberOfDays = calculateRentalDays(startDate, endDate);
  const rentalAmount = numberOfDays * pricePerDay;
  const platformFee = Math.round((rentalAmount * env.platformFeePercent) / 100);
  const ownerEarnings = rentalAmount - platformFee;
  const totalAmount = rentalAmount + securityDeposit;

  return {
    numberOfDays,
    rentalAmount,
    platformFeePercent: env.platformFeePercent,
    platformFee,
    ownerEarnings,
    securityDeposit,
    totalAmount,
    currency: "NPR",
  };
}
