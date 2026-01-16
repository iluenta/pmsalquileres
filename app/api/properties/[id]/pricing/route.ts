import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
        return NextResponse.json({ error: "No connection to database" }, { status: 500 });
    }

    const { data, error } = await supabase
        .from("property_pricing")
        .select("*")
        .eq("property_id", id)
        .order("is_base", { ascending: false }) // Base first
        .order("start_date", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { pricingPeriods, tenantId } = body;

    if (!tenantId) {
        return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    if (!supabase) {
        return NextResponse.json({ error: "No connection to database" }, { status: 500 });
    }

    try {
        // 1. Delete periods that are not in the new list (except base if we want to keep it, but here we replace all)
        // Actually, it's safer to delete all non-base and upsert base, or just delete all and insert everything.
        const { error: deleteError } = await supabase
            .from("property_pricing")
            .delete()
            .eq("property_id", id);

        if (deleteError) throw deleteError;

        // 2. Insert new periods
        const periodsToInsert = pricingPeriods.map((p: any) => ({
            tenant_id: tenantId,
            property_id: id,
            is_base: p.is_base || false,
            season_name: p.season_name || null,
            start_date: p.start_date || null,
            end_date: p.end_date || null,
            price_night: p.price_night || 0,
            price_weekend: p.price_weekend || null,
            price_week: p.price_week || null,
            price_fortnight: p.price_fortnight || null,
            price_month: p.price_month || null,
            extra_guest_price: p.extra_guest_price || 0,
            min_nights: p.min_nights || 1,
        }));

        const { error: insertError } = await supabase
            .from("property_pricing")
            .insert(periodsToInsert);

        if (insertError) throw insertError;

        // 3. Sync base price to main properties table for backward compatibility/legacy views
        const basePeriod = pricingPeriods.find((p: any) => p.is_base);
        if (basePeriod) {
            await supabase
                .from("properties")
                .update({
                    base_price_per_night: basePeriod.price_night,
                    min_nights: basePeriod.min_nights
                })
                .eq("id", id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
