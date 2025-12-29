import { describe, it, expect } from 'vitest';
import { calculateBookingFinancials } from '@/lib/utils/financials';

describe('Booking Financial Logic', () => {
    it('calculates totals correctly for a standard booking with sales commission and tax', () => {
        const result = calculateBookingFinancials({
            basePrice: 100,
            nights: 3,
            salesCommissionRate: 15,
            taxRate: 10,
            applyTax: true
        });

        expect(result.totalAmount).toBe(300);
        expect(result.salesCommissionAmount).toBe(45); // 15% of 300
        expect(result.taxAmount).toBe(25.5); // 10% of (300 - 45) = 255
        expect(result.netAmount).toBe(229.5); // 300 - 45 - 0 - 25.5
    });

    it('handles collection commission correctly', () => {
        const result = calculateBookingFinancials({
            basePrice: 100,
            nights: 1,
            salesCommissionRate: 10,
            collectionCommissionRate: 5,
            taxRate: 10,
            applyTax: true
        });

        expect(result.totalAmount).toBe(100);
        expect(result.salesCommissionAmount).toBe(10);
        expect(result.collectionCommissionAmount).toBe(5);
        expect(result.taxAmount).toBe(9); // 10% of (100 - 10) = 9
        expect(result.netAmount).toBe(76); // 100 - 10 - 5 - 9
    });

    it('ignores tax if applyTax is false', () => {
        const result = calculateBookingFinancials({
            basePrice: 100,
            nights: 1,
            salesCommissionRate: 10,
            taxRate: 10,
            applyTax: false
        });

        expect(result.taxAmount).toBe(0);
        expect(result.netAmount).toBe(90);
    });
});
