"use server"

import { createClient } from "@/utils/supabase/server"

// Define the shape of the data we want to return to the frontend
export type CommitteeNomination = {
  id: string
  nominee_name: string
  category: string
  position: string
  unit: string
  submitted_at: string
  my_status: "Not Started" | "In Progress" | "Completed" // Computed status
  global_review_count: number // How many people finished reviewing
  my_review_id?: string // ID of the draft if it exists
}

export async function getCommitteeDashboardData(): Promise<CommitteeNomination[]> {
  const supabase = await createClient()
  
  // 1. Get the current Committee Member's ID
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) return []
  const myUserId = authData.user.id

  // 2. Fetch all "Completed" nominations (Submitted by nominators)
  // We also fetch the 'reviews' to see who has worked on them
  const { data: nominations, error } = await supabase
    .from("nominations")
    .select(`
      id,
      nominee_name,
      category,
      position,
      unit,
      created_at,
      status,
      reviews (
        id,
        reviewer_id,
        status
      )
    `)
    .eq("status", "completed") // Only show nominations that are officially submitted
    .order("created_at", { ascending: false })

  if (error || !nominations) {
    console.error("Error fetching nominations:", error)
    return []
  }

  // 3. Transform the data to add "My Status" logic
  const dashboardData: CommitteeNomination[] = nominations.map((nom) => {
    const allReviews = nom.reviews || []

    // A. Count how many TOTAL reviews are marked 'completed' (The Global Count)
    const globalCompletedCount = allReviews.filter((r: any) => r.status === "completed").length

    // B. Find MY specific review record (if I started one)
    const myReview = allReviews.find((r: any) => r.reviewer_id === myUserId)

    // C. Determine the Status Label
    let derivedStatus: "Not Started" | "In Progress" | "Completed" = "Not Started"

    if (myReview?.status === "completed") {
      // I have personally finished this
      derivedStatus = "Completed"
    } else if (globalCompletedCount >= 3) {
      // The "Rule of 3" is met. It is locked/closed for everyone.
      derivedStatus = "Completed"
    } else if (myReview) {
      // I have a record, but it's not completed yet
      derivedStatus = "In Progress"
    } else {
      // I have no record, and the global count is less than 3
      derivedStatus = "Not Started"
    }

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
    }
  })

  return dashboardData
}

export async function getReviewContext(nominationId: string) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return null

  const userId = auth.user.id

  // A. Fetch Nomination & Attachments
  const { data: nomination } = await supabase
    .from("nominations")
    .select(`*, attachments(*)`)
    .eq("id", nominationId)
    .single()

  if (!nomination) return { error: "Nomination not found" }

  // B. Fetch the correct Rubric based on Category
  const { data: rubric } = await supabase
    .from("rubrics")
    .select("*")
    .eq("category", nomination.category)
    .single()

  // C. Fetch MY existing review (if I started one)
  const { data: myReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("nomination_id", nominationId)
    .eq("reviewer_id", userId)
    .maybeSingle()

  // D. Check Global Lock (Rule of 3)
  // Count how many OTHER people have finished
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
    isLocked, // If true, user cannot submit new reviews
  }
}

// 2. Save or Submit the Review
export async function saveCommitteeReview(formData: FormData) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return { success: false, message: "Unauthorized" }

  const nominationId = formData.get("nomination_id") as string
  const action = formData.get("action") as string // 'save' or 'submit'
  
  // Parse the raw form data into a JSON object for the "scores" column
  const rawData = Object.fromEntries(formData.entries())
  
  // Separate metadata from the actual scores
  const recommendation = rawData.recommendation as string
  const comments = rawData.comments as string
  
  // Filter out non-score fields to build the scores_json
  const scoresJson: Record<string, number> = {}
  let totalScore = 0

  Object.keys(rawData).forEach((key) => {
    // If the key is one of our rubric question IDs (we assume anything else is metadata)
    if (key !== "nomination_id" && key !== "action" && key !== "recommendation" && key !== "comments") {
      const score = Number(rawData[key]) || 0
      scoresJson[key] = score
      totalScore += score
    }
  })

  const status = action === "submit" ? "completed" : "in_progress"

  // Upsert the review
  const { error } = await supabase
    .from("reviews")
    .upsert({
      nomination_id: nominationId,
      reviewer_id: auth.user.id,
      scores_json: scoresJson,
      total_score: totalScore,
      recommendation,
      comments,
      status,
      updated_at: new Date().toISOString(),
    }, { onConflict: "nomination_id, reviewer_id" })

  if (error) {
    console.error("Save error:", error)
    return { success: false, message: "Failed to save review" }
  }

  return { success: true, message: action === "submit" ? "Review submitted!" : "Draft saved." }
}