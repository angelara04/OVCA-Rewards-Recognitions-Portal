"use server"

import { createClient } from "@/utils/supabase/server"
import { google } from "googleapis"
import { Readable } from "stream"

const SCOPES = ["https://www.googleapis.com/auth/drive.file"]

// ---------------------------------------------------------
// UPLOAD TO GOOGLE DRIVE
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// CREATE OR UPDATE NOMINATION
// ---------------------------------------------------------
export async function createOrUpdateNomination(formData: FormData) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user)
    return { success: false, message: "User not authenticated" }

  const userId = authData.user.id

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle()

  if (profileError || !profile)
    return { success: false, message: "User profile not found" }

  const nominator_name = profile.name
  const nominationId = formData.get("nomination_id") as string | null
  const category = formData.get("category") as string
  const nominee_name = formData.get("nominee_name") as string
  const position = formData.get("position") as string
  const unit = formData.get("unit") as string
  const length_of_service = formData.get("length_of_service") as string
  const achievements = formData.get("achievements") as string
  const status = formData.get("status") as string

  let idToUse = nominationId

  // CREATE
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

    if (error || !data)
      return { success: false, message: "Error creating nomination" }
    idToUse = data.id
  }
  // UPDATE
  else {
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

    if (updateError)
      return { success: false, message: "Error updating nomination" }
  }

  // FILE UPLOADS
  const files = formData.getAll("attachments") as (File | Blob)[]
  for (const file of files) {
    const fileName = (file as File).name
    const driveFileId = await uploadToDrive(file, fileName)

    await supabase.from("attachments").insert({
      nomination_id: idToUse,
      file_name: fileName,
      file_type: (file as any).type,
      file_size: (file as any).size,
      drive_file_id: driveFileId,
    })
  }

  return {
    success: true,
    message: "Nomination and attachments saved successfully",
    id: idToUse,
  }
}

// ---------------------------------------------------------
// GET NOMINATIONS FOR LOGGED-IN USER
// ---------------------------------------------------------
export async function getMyNominations() {
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) return []

  const userId = authData.user.id

  const { data: nominations } = await supabase
    .from("nominations")
    .select(
      `
      id,
      category,
      nominee_name,
      position,
      unit,
      status,
      created_at,
      attachments:attachments (
        id,
        file_name,
        file_type,
        file_size,
        drive_file_id
      )
    `
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  return nominations || []
}
