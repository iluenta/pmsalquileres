import { NextResponse } from "next/server"
import { validateSlugUniqueness } from "@/lib/api/properties"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, excludePropertyId } = body

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Slug es requerido" },
        { status: 400 }
      )
    }

    const isUnique = await validateSlugUniqueness(slug, excludePropertyId)

    return NextResponse.json({ isUnique })
  } catch (error: any) {
    console.error("Error checking slug uniqueness:", error)
    return NextResponse.json(
      { error: error.message || "Error al verificar la unicidad del slug" },
      { status: 500 }
    )
  }
}

