"use server"

import { createSalesChannel } from "@/lib/api/sales-channels"
import type { CreateSalesChannelData } from "@/types/sales-channels"

/**
 * Server action to create a sales channel.
 * Ensuring clean recreation.
 */
export async function handleCreateSalesChannelAction(data: CreateSalesChannelData, tenantId: string): Promise<boolean> {
    const result = await createSalesChannel(data, tenantId)
    return result !== null
}
