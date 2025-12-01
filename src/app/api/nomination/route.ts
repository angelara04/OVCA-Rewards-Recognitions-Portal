import { NextResponse } from 'next/server'
import { createOrUpdateNomination } from '@/app/nominators/actions'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const result = await createOrUpdateNomination(form);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}

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

    const { data: nomination, error } = await supabase
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

    if (error || !nomination) {
      return NextResponse.json({ success: false, message: 'Nomination not found' }, { status: 404 })
    }


    if (nomination.created_by !== authData.user.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { data: attachments } = await supabase
      .from('attachments')
      .select('id, file_name, file_type, file_size, drive_file_id')
      .eq('nomination_id', nomination_id)


    return NextResponse.json({
      success: true,
      nomination,
      attachments: attachments || []
    })
  } catch (e: any) {
    console.error('GET /api/nomination error', e)
    return NextResponse.json({ success: false, message: e.message || 'Server error' }, { status: 500 })
  }
}
