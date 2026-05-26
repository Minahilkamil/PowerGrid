/**
 * Calculate electricity bill based on units consumed.
 *
 * Slab rates:
 *   Units   1 - 100  : PKR 5  per unit
 *   Units 101 - 300  : PKR 10 per unit
 *   Units 301+       : PKR 15 per unit
 *
 * Additional charges:
 *   Fuel adjustment  : 2%  of base amount
 *   Service tax      : 17% of base amount
 *   Meter rent       : PKR 50 (fixed)
 *   Late fee         : PKR 200 (applied separately when marking overdue)
 */
export const calculateBill = (unitsConsumed) => {
  let baseAmount = 0;

  if (unitsConsumed <= 100) {
    baseAmount = unitsConsumed * 5;
  } else if (unitsConsumed <= 300) {
    baseAmount = 100 * 5 + (unitsConsumed - 100) * 10;
  } else {
    baseAmount = 100 * 5 + 200 * 10 + (unitsConsumed - 300) * 15;
  }

  const fuelAdjustment = parseFloat((baseAmount * 0.02).toFixed(2));
  const serviceTax = parseFloat((baseAmount * 0.17).toFixed(2));
  const meterRent = 50;
  const totalAmount = parseFloat(
    (baseAmount + fuelAdjustment + serviceTax + meterRent).toFixed(2)
  );

  return {
    baseAmount: parseFloat(baseAmount.toFixed(2)),
    fuelAdjustment,
    serviceTax,
    meterRent,
    totalAmount,
  };
};

export const LATE_FEE = 200;
