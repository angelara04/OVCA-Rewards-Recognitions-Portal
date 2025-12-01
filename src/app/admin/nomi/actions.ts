"use server"


import { createClient } from "@/utils/supabase/server"
import { google } from "googleapis"
import { Readable } from "stream"


const SCOPES = ["https://www.googleapis.com/auth/drive.file"]


async function uploadToDrive(file: File | Blob, fileName: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  })


  const drive = google.drive({ version: "v3", auth })
  const buffer = Buffer.from(await file.arrayBuffer())


  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [process.env.DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType: (file as any).type || "application/octet-stream",
      body: Readable.from(buffer),
    },
    supportsAllDrives: true,
  })


  return response.data.id
}


async function deleteFromDrive(fileId: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  })


  const drive = google.drive({ version: "v3", auth })


  try {
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    })
  } catch (e) {
    console.error("Drive delete failed:", e)
  }
}


export async function createOrUpdateNomination(formData: FormData) {
  const supabase = await createClient()


  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user)
    return { success: false, message: "User not authenticated" }


  const userId = authData.user.id


  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle()


  const nominator_name = profile?.name || ""
  const nominationId = formData.get("nomination_id") as string | null
  const action = formData.get("action") as string
  const status = action === "submit" ? "completed" : "in_progress"


  // Form Fields
  const category = formData.get("category") as string
  const nominee_name = formData.get("nominee_name") as string
  const position = formData.get("position") as string
  const unit = formData.get("unit") as string
  const length_of_service = formData.get("length_of_service") as string
  const achievements = formData.get("achievements") as string


  let idToUse = nominationId


  // --- 1. NOMINATION RECORD CREATION / UPDATE ---
 
  if (idToUse) {
    // Check if already completed
    const { data: existing } = await supabase
      .from("nominations")
      .select("status")
      .eq("id", idToUse)
      .maybeSingle()


    if (existing?.status === "completed") {
      return { success: false, message: "Cannot edit submitted nomination." }
    }
   
    // Update existing
    const { error } = await supabase
      .from("nominations")
      .update({ category, nominee_name, position, unit, length_of_service, achievements, status })
      .eq("id", idToUse)


    if (error) return { success: false, message: "Error updating nomination" }


  } else {
    // Create new
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


    if (error || !data) return { success: false, message: "Error creating nomination" }
    idToUse = data.id
  }


  // --- 2. HANDLE REMOVED EXISTING ATTACHMENTS ---
 
  // We expect a single JSON array containing IDs of ALL attachments (both evidence and consent) the user decided to KEEP.
  const keptAttachmentsJSON = formData.get("existing_attachments_json") as string
  const keptAttachments = keptAttachmentsJSON ? JSON.parse(keptAttachmentsJSON) : []


  // Fetch all currently saved attachments for this nomination
  const { data: previousAttachments } = await supabase
    .from("attachments")
    .select("*")
    .eq("nomination_id", idToUse)


  // Find which ones are NOT in the "kept" list
  const removed = previousAttachments?.filter(
    att => !keptAttachments.some((k: any) => k.id === att.id)
  )


  // Delete them from DB and Drive
  for (const att of removed || []) {
    await supabase.from("attachments").delete().eq("id", att.id)
    await deleteFromDrive(att.drive_file_id)
  }


  // --- 3. HANDLE NEW EVIDENCE UPLOADS ---
  const newEvidenceFiles = formData.getAll("attachments") as (File | Blob)[]
  for (const file of newEvidenceFiles) {
    if(file.size > 0) {
        const driveFileId = await uploadToDrive(file, (file as File).name)
        await supabase.from("attachments").insert({
          nomination_id: idToUse,
          file_name: (file as File).name,
          file_type: (file as any).type,
          file_size: (file as any).size,
          drive_file_id: driveFileId,
          attachment_type: 'evidence' // <--- Marked as Evidence
        })
    }
  }


  // --- 4. HANDLE NEW CONSENT UPLOADS ---
  const newConsentFiles = formData.getAll("consent_attachments") as (File | Blob)[]
  for (const file of newConsentFiles) {
    if(file.size > 0) {
        const driveFileId = await uploadToDrive(file, (file as File).name)
        await supabase.from("attachments").insert({
          nomination_id: idToUse,
          file_name: (file as File).name,
          file_type: (file as any).type,
          file_size: (file as any).size,
          drive_file_id: driveFileId,
          attachment_type: 'consent' // <--- Marked as Consent
        })
    }
  }


  return {
    success: true,
    message: action === "submit" ? "Nomination submitted successfully" : "Draft saved successfully",
    id: idToUse,
  }
}


export async function getMyNominations() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()


  if (!authData?.user) return []


  const { data: nominations } = await supabase
    .from("nominations")
    .select(`
      id, category, nominee_name, position, unit, length_of_service, achievements, status, created_at,
      attachments:attachments (
        id, file_name, file_type, file_size, drive_file_id, attachment_type
      )
    `)
    .eq("created_by", authData.user.id)
    .order("created_at", { ascending: false })


  return nominations || []
}


export async function deleteNomination(nominationId: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()


  if (!authData?.user) return { success: false, message: "User not authenticated" }


  const { data: nomination } = await supabase
    .from("nominations")
    .select("id, created_by, status")
    .eq("id", nominationId)
    .maybeSingle()


  if (!nomination) return { success: false, message: "Nomination not found" }
  if (nomination.created_by !== authData.user.id) return { success: false, message: "Unauthorized" }
  if (nomination.status !== "in_progress") return { success: false, message: "Only drafts can be deleted" }


  // Fetch all attachments (evidence and consent)
  const { data: attachments } = await supabase
    .from("attachments")
    .select("drive_file_id")
    .eq("nomination_id", nominationId)


  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      await deleteFromDrive(att.drive_file_id)
    }
  }


  // Delete from DB (Attachments should cascade delete, but if not, this relies on CASCADE setting)
  // If you don't have CASCADE set up in Supabase:
  // await supabase.from("attachments").delete().eq("nomination_id", nominationId)


  const { error } = await supabase
    .from("nominations")
    .delete()
    .eq("id", nominationId)


  if (error) return { success: false, message: "Database error" }


  return { success: true, message: "Draft deleted successfully" }
}
