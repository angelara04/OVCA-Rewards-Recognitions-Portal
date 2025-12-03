import { NextResponse } from 'next/server'
import { createOrUpdateNomination } from '@/app/nominators/actions'
import { createClient } from '@/utils/supabase/server'

type Nomination = {
  id: string
  created_by: string
  nominator_name: string
  category: string
  nominee_name: string
  position: string
  unit: string
  length_of_service: string | null
  achievements: string | null
  status: string
  created_at: string
}

type Attachment = {
  id: string
  file_name: string
  file_type: string | null
  file_size: number | null
  drive_file_id: string
  attachment_type: string
}

// ------------------- POST -------------------
export async function POST(req: Request) {
  try {
    const form = await req.formData() // keep as FormData
    const result = await createOrUpdateNomination(form)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('POST /api/nomination error', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Server error' },
      { status: 500 }
    )
  }
}

// ------------------- GET -------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const nomination_id = url.searchParams.get('nomination_id')
    if (!nomination_id) {
      return NextResponse.json({ success: false, message: 'nomination_id required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    // Fetch nomination
    const { data, error } = await supabase
      .from('nominations')
      .select(`
        id,
        created_by,
        nominator_name,
        category,
        nominee_name,
        position,
        unit,
        length_of_service,
        achievements,
        status,
        created_at
      `)
      .eq('id', nomination_id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Nomination not found' }, { status: 404 })
    }

    const nomination = data as Nomination

    // Authorization
    if (nomination.created_by !== authData.user.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    // Fetch attachments
    const { data: attachmentsData } = await supabase
      .from('attachments')
      .select('id, file_name, file_type, file_size, drive_file_id, attachment_type')
      .eq('nomination_id', nomination_id)

    const attachments: Attachment[] = attachmentsData || []

    // Separate evidence vs consent attachments
    const evidenceAttachments = attachments.filter(a => a.attachment_type === 'evidence')
    const consentAttachments = attachments.filter(a => a.attachment_type === 'consent')

    return NextResponse.json({
      success: true,
      nomination,
      attachments: {
        evidence: evidenceAttachments,
        consent: consentAttachments,
      },
    })
  } catch (e: any) {
    console.error('GET /api/nomination error', e)
    return NextResponse.json({ success: false, message: e.message || 'Server error' }, { status: 500 })
  }
}
