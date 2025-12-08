"use server"

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch completed nominations
    const { data: nominations } = await supabase
      .from("nominations")
      .select(`id, nominee_name, category, position, unit, evaluation_result`)
      .eq("status", "completed")
      .order("created_at", { ascending: false })

    if (!nominations) return NextResponse.json({ data: [] })

    // For each nomination, fetch its completed reviews with reviewer name
    const results = await Promise.all(
      nominations.map(async (nom: any) => {
        const { data: reviews } = await supabase
          .from("reviews")
          .select(`*, reviewer:profiles ( name )`)
          .eq("nomination_id", nom.id)
          .eq("status", "completed")

        // fetch rubric to know max if needed
        const { data: rubric } = await supabase
          .from("rubrics")
          .select("criteria")
          .eq("category", nom.category)
          .maybeSingle()

        return {
          id: nom.id,
          nominee_name: nom.nominee_name,
          category: nom.category,
          position: nom.position,
          unit: nom.unit,
          evaluation_result: nom.evaluation_result,
          rubric: rubric || null,
          reviews: reviews || [],
        }
      })
    )

    return NextResponse.json({ data: results })
  } catch (err) {
    return NextResponse.json({ data: [], error: String(err) })
  }
}
