/**
 * Centralized configuration codes used throughout the application.
 * These codes correspond to the 'code' column in the configuration_types table.
 * Using stable codes avoids issues with translated names or multi-tenant customizations.
 */
export const CONFIG_CODES = {
    PROPERTY_TYPE: 'PROPERTY_TYPE',
    BOOKING_STATUS: 'BOOKING_STATUS',
    PERSON_TYPE: 'PERSON_TYPE',
    TAX_TYPE: 'TAX_TYPE',
    MOVEMENT_TYPE: 'MOVEMENT_TYPE',
    PAYMENT_METHOD: 'PAYMENT_METHOD',
    BOOKING_TYPE: 'BOOKING_TYPE',
} as const;

export type ConfigCode = keyof typeof CONFIG_CODES;
