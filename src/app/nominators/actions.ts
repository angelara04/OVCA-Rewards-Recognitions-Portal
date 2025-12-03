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
  const action = (formData.get("action") as string) || "save"
  const status = action === "submit" ? "completed" : "in_progress"

  // Allow empty fields for draft
  const category = (formData.get("category") as string) || ""
  const nominee_name = (formData.get("nominee_name") as string) || ""
  const position = (formData.get("position") as string) || ""
  const unit = (formData.get("unit") as string) || ""
  const length_of_service = (formData.get("length_of_service") as string) || ""
  const achievements = (formData.get("achievements") as string) || ""

  let idToUse = nominationId

  // Prevent editing completed nominations
  if (idToUse) {
    const { data: existing } = await supabase
      .from("nominations")
      .select("status")
      .eq("id", idToUse)
      .maybeSingle()

    if (existing?.status === "completed") {
      return { success: false, message: "This nomination is already submitted and cannot be edited." }
    }
  }

  // CREATE NEW NOMINATION
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

    if (error) {
      console.error("Supabase insert error:", error)
      return { success: false, message: "Error creating nomination: " + error.message }
    }

    if (!data) {
      return { success: false, message: "Error creating nomination: no data returned" }
    }

    idToUse = data.id
  } else {
    // UPDATE NOMINATION
    const { error } = await supabase
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

    if (error) return { success: false, message: "Error updating nomination" }
  }

  // --- Handle attachments ---

  let existingAttachmentsRaw = formData.get("existing_attachments")
  let existingAttachments: any[] = []

  try {
    existingAttachments = existingAttachmentsRaw
      ? JSON.parse(existingAttachmentsRaw as string) || []
      : []
  } catch {
    existingAttachments = []
  }

  const { data: previousAttachments } = await supabase
    .from("attachments")
    .select("*")
    .eq("nomination_id", idToUse)

  // Delete removed **evidence attachments only**
  const removed = (previousAttachments || []).filter(att => {
    if (att.attachment_type === "consent") return false
    return !existingAttachments.some((e) => e.id === att.id)
  })

  for (const att of removed || []) {
    try {
      await supabase.from("attachments").delete().eq("id", att.id)
      if (att.drive_file_id) await deleteFromDrive(att.drive_file_id)
    } catch (e) {
      console.error("Failed to delete removed attachment", att.id, e)
    }
  }

  // Add new **evidence attachments only**
  const newFiles = formData.getAll("attachments") as (File | Blob)[]
  for (const file of newFiles) {
    if ((file as any).size === 0) continue
    const driveFileId = await uploadToDrive(file, (file as File).name)
    await supabase.from("attachments").insert({
      nomination_id: idToUse,
      file_name: (file as File).name,
      file_type: (file as any).type,
      file_size: (file as any).size,
      drive_file_id: driveFileId,
      attachment_type: "evidence",
    })
  }

  // Handle **consent/signature separately**
  const signature = formData.get("signature") as File | null
  if (signature && (signature as any).size > 0) {
    const previousConsent = (previousAttachments || []).filter((p: any) => p.attachment_type === "consent")
    for (const c of previousConsent) {
      try {
        await supabase.from("attachments").delete().eq("id", c.id)
        if (c.drive_file_id) await deleteFromDrive(c.drive_file_id)
      } catch (e) {
        console.error("Failed to delete previous consent", c.id, e)
      }
    }

    const driveFileId = await uploadToDrive(signature, (signature as File).name)
    await supabase.from("attachments").insert({
      nomination_id: idToUse,
      file_name: (signature as File).name,
      file_type: (signature as any).type,
      file_size: (signature as any).size,
      drive_file_id: driveFileId,
      attachment_type: "consent",
    })
  }

  return {
    success: true,
    message: action === "submit"
      ? "Nomination submitted successfully"
      : "Draft saved successfully",
    id: idToUse,
  }
}
