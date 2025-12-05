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
  evaluation_result?: string 
  nominator_name?: string
  nominator_id: string
}

export async function getCommitteeDashboardData(): Promise<CommitteeNomination[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return [];

  const myUserId = authData.user.id;

  // 1. Get total committee reviewers dynamically
  const { data: committeeMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "committee");

  const committeeCount = committeeMembers?.length || 0;

  // 2. Fetch nominations and their reviews
  const { data: nominations, error } = await supabase
    .from("nominations")
    .select(`
      id, nominee_name, category, position, unit, created_at, status, evaluation_result, nominator_name, created_by,
      reviews(id, reviewer_id, status)
    `)
    .order("created_at", { ascending: false });

  if (error || !nominations) return [];

  const mapped: CommitteeNomination[] = nominations.map((nom) => {
    const allReviews = nom.reviews || [];
    const globalCompletedCount = allReviews.filter((r) => r.status === "completed").length;

    const myReview = allReviews.find((r) => r.reviewer_id === myUserId);

    let myStatus: "Not Started" | "In Progress" | "Completed" = "Not Started";
    if (myReview?.status === "completed") myStatus = "Completed";
    else if (myReview?.status === "in_progress") myStatus = "In Progress";

    return {
      id: nom.id,
      nominee_name: nom.nominee_name,
      category: nom.category,
      position: nom.position,
      unit: nom.unit,
      submitted_at: nom.created_at,
      my_status: myStatus,
      global_review_count: globalCompletedCount,
      my_review_id: myReview?.id,
      evaluation_result: nom.evaluation_result,
      nominator_id: nom.created_by,
      nominator_name: nom.nominator_name,
    };
  });

  return mapped
}

export async function getReviewContext(nominationId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const userId = auth.user.id;

  // Fetch Nomination
  const { data: nomination } = await supabase
    .from("nominations")
    .select(`*, attachments(*)`)
    .eq("id", nominationId)
    .single();

  if (!nomination) return { error: "Nomination not found" };

  // Fetch Rubric
  const { data: rubric } = await supabase
    .from("rubrics")
    .select("*")
    .eq("category", nomination.category)
    .single();

  // Fetch My Review
  const { data: myReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("nomination_id", nominationId)
    .eq("reviewer_id", userId)
    .maybeSingle();

  // Fetch number of committee members
  const { data: committeeMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "committee");

  const committeeCount = committeeMembers?.length || 0;

  // Count Global Completed Reviews
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("nomination_id", nominationId)
    .eq("status", "completed");

  const globalCompletedCount = count || 0;

  // Dynamic Lock Logic
  const isLocked =
    globalCompletedCount >= committeeCount &&
    myReview?.status !== "completed";

  return {
    nomination,
    rubric,
    existingReview: myReview,
    isLocked,
  };
}

// --- UPDATED SAVE ACTION WITH CALCULATION LOGIC ---
export async function saveCommitteeReview(formData: FormData) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return { success: false, message: "Unauthorized" }

  const nominationId = formData.get("nomination_id") as string
  const action = formData.get("action") as string
  
  const rawData = Object.fromEntries(formData.entries())
  const comments = rawData.comments as string
  
  // Changed to 'any' to allow saving the metadata object
  const scoresJson: Record<string, any> = {}
  let myTotalScore = 0

  // 1. Capture Breakdown Data + Supervisor Details
  const breakdownData = {
    y2022: parseFloat(rawData["y2022"] as string) || 0,
    y2023: parseFloat(rawData["y2023"] as string) || 0,
    y2024: parseFloat(rawData["y2024"] as string) || 0,
    supervisor: rawData["supervisor"] as string || "", // New field
    unit: rawData["unit"] as string || ""              // New field
  }

  // 2. Filter out non-score keys (Critical to prevent math errors)
  const excludedKeys = [
      "nomination_id", "action", "comments", "recommendation", 
      "y2022", "y2023", "y2024", "supervisor", "unit" // All metadata inputs excluded
  ]; 

  Object.keys(rawData).forEach((key) => {
    if (!excludedKeys.includes(key)) {
      // Use parseFloat to preserve decimals (e.g. 53.33)
      const score = parseFloat(rawData[key] as string) || 0
      scoresJson[key] = score
      myTotalScore += score
    }
  })

  // 3. Inject Breakdown Data as Metadata
  scoresJson["meta_ipcr_breakdown"] = breakdownData;

  // Round total score to 2 decimal places for clean DB storage
  myTotalScore = parseFloat(myTotalScore.toFixed(2))

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

export async function getNominationResults(nominationId: string) {
  const supabase = await createClient()

  // 1. Fetch Nomination Details + Attachments + Nominator Name
  const { data: nomination } = await supabase
    .from("nominations")
    .select(`
      *, 
      attachments(*),
      nominator:profiles!created_by ( name ) 
    `)
    // NOTE: Using !created_by ensures we follow the foreign key to the creator
    .eq("id", nominationId)
    .single()

  if (!nomination) return { error: "Nomination not found" }

  // 2. Fetch the Rubric
  const { data: rubric } = await supabase
    .from("rubrics")
    .select("*")
    .eq("category", nomination.category)
    .single()

  // 3. Fetch Reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles ( name ) 
    `)
    .eq("nomination_id", nominationId)
    .eq("status", "completed")

  return { nomination, rubric, reviews }
}