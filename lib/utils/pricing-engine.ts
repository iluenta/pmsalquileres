/**
 * Centralized Pricing Engine
 * Single source of truth for stay price calculations.
 */

export interface PricingPeriod {
    id?: string;
    is_base: boolean;
    season_name?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    price_night: number;
    price_weekend?: number | null;
    price_week?: number | null;
    price_fortnight?: number | null;
    price_month?: number | null;
    extra_guest_price?: number | null;
    min_nights?: number | null;
}

export interface StayPricingParams {
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    baseGuests?: number; // threshold for extra guest charge (e.g., 4)
    basePrice?: number;  // fallback price per night if no periods found
    pricingPeriods: PricingPeriod[];
}

export interface NightlyPrice {
    date: string;
    price: number;
    seasonId?: string;
    isWeekend: boolean;
}

export interface PricingResult {
    totalPrice: number;
    averagePricePerNight: number;
    nightlyBreakdown: NightlyPrice[];
    extraGuestsTotal: number;
    totalNights: number;
    isValid: boolean;
    errorMessage?: string;
}

/**
 * Calculates the total stay price and provides a detailed breakdown.
 */
export function calculateStayPrice(params: StayPricingParams): PricingResult {
    const { checkIn, checkOut, numberOfGuests, baseGuests = 4, pricingPeriods } = params;

    const totalNights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
        return {
            totalPrice: 0,
            averagePricePerNight: 0,
            nightlyBreakdown: [],
            extraGuestsTotal: 0,
            totalNights: 0,
            isValid: false,
            errorMessage: "La fecha de salida debe ser posterior a la de entrada",
        };
    }

    const nightlyBreakdown: NightlyPrice[] = [];
    let totalPrice = 0;

    // 1. Process each night individually to find the applicable season/base rate
    for (let i = 0; i < totalNights; i++) {
        const currentDate = new Date(checkIn);
        currentDate.setDate(checkIn.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Determine if it's a weekend (Friday or Saturday night)
        const dayOfWeek = currentDate.getDay(); // 5 = Friday, 6 = Saturday
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

        // Find the applicable pricing period (Season first, then Base)
        let applicablePeriod = pricingPeriods.find(p =>
            !p.is_base &&
            p.start_date && p.end_date &&
            dateStr >= p.start_date && dateStr <= p.end_date
        );

        if (!applicablePeriod) {
            applicablePeriod = pricingPeriods.find(p => p.is_base);
        }

        // Determine the rate for this night
        let rate: number;

        if (applicablePeriod) {
            // Check minimum nights for the FIRST night selected
            if (i === 0 && totalNights < (applicablePeriod.min_nights || 1)) {
                return {
                    totalPrice: 0,
                    averagePricePerNight: 0,
                    nightlyBreakdown: [],
                    extraGuestsTotal: 0,
                    totalNights,
                    isValid: false,
                    errorMessage: `El mínimo de noches para este periodo es ${applicablePeriod.min_nights}`,
                };
            }

            rate = applicablePeriod.price_night;
            if (isWeekend && applicablePeriod.price_weekend && applicablePeriod.price_weekend > 0) {
                rate = applicablePeriod.price_weekend;
            }
        } else if (params.basePrice !== undefined) {
            // Fallback to provided base price if no period found
            rate = params.basePrice;
        } else {
            return {
                totalPrice: 0,
                averagePricePerNight: 0,
                nightlyBreakdown: [],
                extraGuestsTotal: 0,
                totalNights,
                isValid: false,
                errorMessage: `No hay tarifa configurada para la fecha ${dateStr}`,
            };
        }

        // 2. Apply stay length discounts (Weekly, Fortnightly, Monthly)
        // We calculate these as a daily rate if specified
        if (applicablePeriod) {
            if (totalNights >= 29 && applicablePeriod.price_month && applicablePeriod.price_month > 0) {
                rate = applicablePeriod.price_month / 29;
            } else if (totalNights >= 14 && applicablePeriod.price_fortnight && applicablePeriod.price_fortnight > 0) {
                rate = applicablePeriod.price_fortnight / 14;
            } else if (totalNights >= 7 && applicablePeriod.price_week && applicablePeriod.price_week > 0) {
                rate = applicablePeriod.price_week / 7;
            }
        }

        totalPrice += rate;
        nightlyBreakdown.push({
            date: dateStr,
            price: Math.round(rate * 100) / 100,
            seasonId: applicablePeriod?.id,
            isWeekend,
        });
    }

    // 3. Extra Guest Calculation
    let extraGuestsTotal = 0;
    if (numberOfGuests > baseGuests) {
        const extraNum = numberOfGuests - baseGuests;

        // Sum extra guest price for each night based on the applicable period for that night
        nightlyBreakdown.forEach(night => {
            const period = pricingPeriods.find(p =>
                p.id === night.seasonId || (p.is_base && !night.seasonId)
            );
            const extraPrice = period?.extra_guest_price || 0;
            extraGuestsTotal += extraNum * extraPrice;
        });
    }

    totalPrice += extraGuestsTotal;

    return {
        totalPrice: Math.round(totalPrice * 100) / 100,
        averagePricePerNight: Math.round((totalPrice / totalNights) * 100) / 100,
        nightlyBreakdown,
        extraGuestsTotal: Math.round(extraGuestsTotal * 100) / 100,
        totalNights,
        isValid: true,
    };
}
