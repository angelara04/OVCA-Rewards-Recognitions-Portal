//this file is responsible for handling nomination form submissions
import { NextResponse } from 'next/server'
import { createOrUpdateNomination } from '@/app/admin/nomi/actions' // adjust if needed

export async function POST(req: Request) {
  try {
    const form = await req.formData()

    const action = form.get('action') as string  // 'save' | 'submit'
    const nomination_id = form.get('nomination_id') as string | null

    const payload = {
      action,
      nomination_id,
      category: form.get('category'),
      nominee_name: form.get('nominee_name'),
      position: form.get('position'),
      unit: form.get('unit'),
      length_of_service: form.get('length_of_service'),
      achievements: form.get('achievements'),
      consent_printed_name: form.get('consent_printed_name'),
      attachments: form.getAll('attachments') as File[],
      signature: form.get('signature') as File | null
    }

    // Convert payload → FormData
    const fd = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((file) => fd.append(key, file))
      } else if (value !== null && value !== undefined) {
        fd.append(key, value)
      }
    })

    const result = await createOrUpdateNomination(fd)

    return NextResponse.json({
      success: true,
      message: action === 'save' ? 'Draft Saved' : 'Nomination Submitted',
      id: result.id
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
