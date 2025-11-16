'use server'

import { createClient } from "@/utils/supabase/server"

export async function createOrUpdateNomination(formData: FormData) {
  const supabase = await createClient()

  // 1. Get logged-in user
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    return { success: false, message: "User not authenticated" }
  }

  const userId = authData.user.id

  // 2. Get user's profile (to fetch the name)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle()

  if (profileError || !profile) {
    return { success: false, message: "User profile not found" }
  }

  const nominator_name = profile.name

  // 3. Get nomination details from the form
  const nominationId = formData.get("nomination_id") as string | null
  const category = formData.get("category") as string
  const nominee_name = formData.get("nominee_name") as string
  const position = formData.get("position") as string
  const unit = formData.get("unit") as string
  const length_of_service = formData.get("length_of_service") as string
  const achievements = formData.get("achievements") as string
  const status = formData.get("status") as string

  let idToUse = nominationId

  // 4. Create new nomination
  if (!idToUse) {
    const { data, error } = await supabase
      .from("nominations")
      .insert({
        created_by: userId,
        nominator_name,
        category,
        nominee_name,
        position,
        unit,
        length_of_service,
        achievements,
        status,
      })
      .select("id")
      .maybeSingle()

    if (error || !data) {
      return { success: false, message: "Error creating nomination" }
    }

    idToUse = data.id
  } else {
    // 5. Update existing nomination
    const { error: updateError } = await supabase
      .from("nominations")
      .update({
        category,
        nominee_name,
        position,
        unit,
        length_of_service,
        achievements,
        status,
      })
      .eq("id", idToUse)

    if (updateError) {
      return { success: false, message: "Error updating nomination" }
    }
  }

  return {
    success: true,
    message: "Nomination saved successfully",
    id: idToUse,
  }
}
