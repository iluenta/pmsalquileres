/**
 * Centralized financial calculation logic for the PMS
 */

/**
 * Calculates the total for an expense item including tax
 */
export function calculateExpenseItemTotal(
    amount: number,
    taxPercentage?: number | null
): number {
    if (!taxPercentage || taxPercentage <= 0) {
        return amount
    }
    const taxAmount = (amount * taxPercentage) / 100
    return amount + taxAmount
}

/**
 * Calculates the sum of a list of items with total_amount
 */
export function calculateItemsSum(
    items: Array<{ total_amount: number | string }>
): number {
    return items.reduce((sum, item) => sum + Number(item.total_amount || 0), 0)
}

/**
 * Calculates complete booking financial breakdown
 */
export function calculateBookingFinancials({
    basePrice,
    nights,
    salesCommissionRate = 0,
    collectionCommissionRate = 0,
    taxRate = 0,
    applyTax = false,
}: {
    basePrice: number;
    nights: number;
    salesCommissionRate?: number;
    collectionCommissionRate?: number;
    taxRate?: number;
    applyTax?: boolean;
}) {
    const totalAmount = basePrice * nights;

    // Calculate commissions
    const salesCommissionAmount = (totalAmount * salesCommissionRate) / 100;
    const collectionCommissionAmount = (totalAmount * collectionCommissionRate) / 100;

    // Tax is usually applied on the net after commissions or on total depending on Business Logic
    // Assuming tax is on (Total - Sales Commission) as per movements.ts taxableAmount logic
    const taxableAmount = totalAmount - salesCommissionAmount;
    const taxAmount = applyTax ? (taxableAmount * taxRate) / 100 : 0;

    const netAmount = totalAmount - salesCommissionAmount - collectionCommissionAmount - taxAmount;

    return {
        totalAmount,
        salesCommissionAmount,
        collectionCommissionAmount,
        taxAmount,
        netAmount,
    };
}
