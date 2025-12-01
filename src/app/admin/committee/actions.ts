"use server"

import { createClient } from "@/utils/supabase/server"

// Define the shape of the data
export type CommitteeNomination = {
  id: string
  nominee_name: string
  category: string
  position: string
  unit: string
  submitted_at: string
  my_status: "Not Started" | "In Progress" | "Completed"
  global_review_count: number
  my_review_id?: string
  evaluation_result?: string // New field
}

export async function getCommitteeDashboardData(): Promise<CommitteeNomination[]> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) return []
  const myUserId = authData.user.id

  const { data: nominations, error } = await supabase
    .from("nominations")
    .select(`
      id, nominee_name, category, position, unit, created_at, status, evaluation_result,
      reviews ( id, reviewer_id, status )
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false })

  if (error || !nominations) return []

  return nominations.map((nom) => {
    const allReviews = nom.reviews || []
    const globalCompletedCount = allReviews.filter((r: any) => r.status === "completed").length
    const myReview = allReviews.find((r: any) => r.reviewer_id === myUserId)

    let derivedStatus: "Not Started" | "In Progress" | "Completed" = "Not Started"

    if (myReview?.status === "completed") derivedStatus = "Completed"
    else if (globalCompletedCount >= 3) derivedStatus = "Completed" // Locked
    else if (myReview) derivedStatus = "In Progress"

    return {
      id: nom.id,
      nominee_name: nom.nominee_name,
      category: nom.category,
      position: nom.position,
      unit: nom.unit,
      submitted_at: nom.created_at,
      my_status: derivedStatus,
      global_review_count: globalCompletedCount,
      my_review_id: myReview?.id,
      evaluation_result: nom.evaluation_result // Return the verdict if it exists
    }
  })
}

export async function getReviewContext(nominationId: string) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return null

  const userId = auth.user.id

  // Fetch Nomination
  const { data: nomination } = await supabase
    .from("nominations")
    .select(`*, attachments(*)`)
    .eq("id", nominationId)
    .single()

  if (!nomination) return { error: "Nomination not found" }

  // Fetch Rubric
  const { data: rubric } = await supabase
    .from("rubrics")
    .select("*")
    .eq("category", nomination.category)
    .single()

  // Fetch My Review
  const { data: myReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("nomination_id", nominationId)
    .eq("reviewer_id", userId)
    .maybeSingle()

  // Check Global Lock
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("nomination_id", nominationId)
    .eq("status", "completed")

  const globalCompletedCount = count || 0
  const isLocked = globalCompletedCount >= 3 && myReview?.status !== "completed"

  return {
    nomination,
    rubric,
    existingReview: myReview,
    isLocked,
  }
}

// --- UPDATED SAVE ACTION WITH CALCULATION LOGIC ---
export async function saveCommitteeReview(formData: FormData) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return { success: false, message: "Unauthorized" }

  const nominationId = formData.get("nomination_id") as string
  const action = formData.get("action") as string
  
  // Parse scores
  const rawData = Object.fromEntries(formData.entries())
  const comments = rawData.comments as string
  
  const scoresJson: Record<string, number> = {}
  let myTotalScore = 0

  Object.keys(rawData).forEach((key) => {
    if (!["nomination_id", "action", "comments", "recommendation"].includes(key)) {
      const score = Number(rawData[key]) || 0
      scoresJson[key] = score
      myTotalScore += score
    }
  })

  const status = action === "submit" ? "completed" : "in_progress"

  // 1. Save the individual review
  const { error } = await supabase
    .from("reviews")
    .upsert({
      nomination_id: nominationId,
      reviewer_id: auth.user.id,
      scores_json: scoresJson,
      total_score: myTotalScore,
      comments,
      status,
      updated_at: new Date().toISOString(),
    }, { onConflict: "nomination_id, reviewer_id" })

  if (error) return { success: false, message: "Failed to save review" }

  // 2. IF SUBMITTING: Check if we need to calculate the Final Verdict
  if (action === "submit") {
    
    // Count how many finished reviews exist now
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("total_score")
      .eq("nomination_id", nominationId)
      .eq("status", "completed")

    // If we hit the magic number 3
    if (allReviews && allReviews.length >= 3) {
      
      // A. Calculate Average
      const sumOfReviewers = allReviews.reduce((sum, r) => sum + (r.total_score || 0), 0)
      const averageScore = sumOfReviewers / allReviews.length

      // B. Get Max Possible Score from Rubric
      // We need to fetch the nomination first to get the category
      const { data: nom } = await supabase
        .from("nominations")
        .select("category")
        .eq("id", nominationId)
        .single()
      
      const { data: rubric } = await supabase
        .from("rubrics")
        .select("criteria")
        .eq("category", nom?.category)
        .single()
      
      // Sum up the 'max' fields in the criteria JSON
      const maxPossibleScore = (rubric?.criteria as any[]).reduce((sum: number, item: any) => sum + (item.max || 0), 0)

      // C. The 70% Logic
      const passingScore = maxPossibleScore * 0.70
      const finalVerdict = averageScore >= passingScore ? "Qualified" : "Disqualified"

      // D. Update the Nomination Record
      await supabase
        .from("nominations")
        .update({ evaluation_result: finalVerdict })
        .eq("id", nominationId)
    }
  }

  return { success: true, message: action === "submit" ? "Review submitted!" : "Draft saved." }
}