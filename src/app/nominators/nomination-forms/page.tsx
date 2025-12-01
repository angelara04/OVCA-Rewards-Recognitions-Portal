'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Section from '@/components/section'
import Button from '@/components/button'
import Input from '@/components/input'
import Dropdown from '@/components/dropdown'
import SearchableDropdown from '@/components/searchable-dropdown'
import ConfirmModal from '@/components/confirm-modal'
import { Upload, FileText, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UploadedFile {
  file: File | null
  uploaded: boolean
  name?: string
  size?: number
  id?: string | number
  drive_file_id?: string
}

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nominationIdParam = searchParams?.get('nomination_id')
  const viewParam = searchParams?.get('view') 

  const [nomineeName, setNomineeName] = useState('')
  const [position, setPosition] = useState('')
  const [unitSearchText, setUnitSearchText] = useState('')
  const [unit, setUnit] = useState('')
  const [length, setLength] = useState('')
  const [description, setDescription] = useState('')
  const [descWords, setDescWords] = useState(0)
  const [consentName, setConsentName] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [sigDragActive, setSigDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fname, setFname] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [readonly, setReadonly] = useState(false)
  const [category, setCategory] = useState('')

  useEffect(() => {
    const words = description.trim() === '' ? 0 : description.trim().split(/\s+/).length
    setDescWords(words)
  }, [description])

  useEffect(() => {
    if (unit) setUnitSearchText(unit)
  }, [unit])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          if (data?.name) setFname(data.name)
        }
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  useEffect(() => {
    if (!nominationIdParam) {
      setReadonly(viewParam === '1')
      return
    }

    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/nomination?nomination_id=${encodeURIComponent(nominationIdParam)}`)
        if (!res.ok) {
          const text = await res.text()
          console.error('Failed to fetch nomination', res.status, text)
          if (!mounted) return
          setToast('Failed to load nomination')
          setLoading(false)
          return
        }
        const data = await res.json()
        if (!mounted) return

        const nom = data?.nomination
        if (!nom) {
          setToast('Nomination not found')
          setLoading(false)
          return
        }

        setNomineeName(nom.nominee_name || '')
        setPosition(nom.position || '')
        setUnit(nom.unit || '')
        setUnitSearchText(nom.unit || '')
        setLength(nom.length_of_service?.toString?.() || '')
        setDescription(nom.achievements || '')
        if (nom.consent_printed_name) setConsentName(nom.consent_printed_name)

        setEditingId(nom.id)
        setCategory(nom.category || '')

        if (Array.isArray(data.attachments) && data.attachments.length > 0) {
          const mapped = data.attachments.map((a: any) => ({
            file: null,
            uploaded: true,
            name: a.file_name,
            size: a.file_size,
            id: a.id,
            drive_file_id: a.drive_file_id,
          }))
          setFiles(mapped)
        } else {
          setFiles([])
        }

        if (data.signature_url) {
          setSignaturePreview(data.signature_url)
        } else {
          setSignaturePreview(null)
        }

        if (viewParam === '1' || nom.status === 'completed') setReadonly(true)
        else setReadonly(false)
      } catch (err) {
        console.error(err)
        setToast('Error loading nomination')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [nominationIdParam, viewParam])

  const acceptedTypes = ['.jpg', '.png', '.zip', '.docx', '.pdf']

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const formatFileSize = (bytes?: number): string => {
    if (bytes == null) return ''
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const processFiles = (selected: File[]) => {
    const valid = selected.filter((file) =>
      acceptedTypes.some((ext) => file.name.toLowerCase().endsWith(ext))
    )
    if (valid.length < selected.length) showToast('Some files were rejected (unsupported type)')
    const newFiles = valid.map((f) => ({ file: f, uploaded: false, name: f.name, size: f.size } as UploadedFile))
    setFiles((prev) => [...prev, ...newFiles])

    newFiles.forEach((nf) => {
      setTimeout(() => {
        setFiles((prev) => prev.map((p) => (p.file === nf.file ? { ...p, uploaded: true } : p)))
      }, 900)
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files))
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (readonly) return
    setDragActive(false)
    processFiles(Array.from(e.dataTransfer.files))
  }, [readonly])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (readonly) return
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleRemoveFile = (index: number) => {
    if (readonly) return
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

const handleDownloadFile = (entry: UploadedFile) => {
  if (entry.file) {
    const url = URL.createObjectURL(entry.file)
    const a = document.createElement('a')
    a.href = url
    a.download = entry.name || 'file'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return
  }

  if (entry.id) {
    const downloadUrl = `https://drive.google.com/uc?id=${entry.drive_file_id}&export=download`
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = entry.name || 'file'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  showToast('File not available for download')
}


  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      showToast('Signature file must be PNG or JPG')
      return
    }
    setSignatureFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setSignaturePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDropSignature = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (readonly) return
    setSigDragActive(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      showToast('Signature file must be PNG or JPG')
      return
    }
    setSignatureFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setSignaturePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSigDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (readonly) return
    setSigDragActive(true)
  }

  const handleSigDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setSigDragActive(false)
  }

  const removeSignature = () => {
    if (readonly) return
    setSignatureFile(null)
    setSignaturePreview(null)
  }

  const handleLengthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '')
    if (numericValue === '' || /^\d+(\.\d*)?$/.test(numericValue)) {
      setLength(numericValue)
    }
  }

  async function submitToServer(action: 'save' | 'submit') {
    if (readonly) return
    if (!nomineeName.trim()) return showToast('Please fill nominee name.')
    if (!position.trim()) return showToast('Please fill position.')
    if (!unit.trim()) return showToast('Please select unit/office/college.')
    if (!description.trim()) return showToast('Please add a short description.')
    if (!consentName.trim()) return showToast('Please fill the printed name for nominee consent.')

    const setLoadingState = action === 'save' ? setSavingDraft : setSubmitting
    setLoadingState(true)

    try {
      const formData = new FormData()
      if (editingId) formData.append('nomination_id', editingId)
      formData.append('action', action)
      formData.append('category', category || '')
      formData.append('nominee_name', nomineeName)
      formData.append('position', position)
      formData.append('unit', unit)
      formData.append('length_of_service', length)
      formData.append('achievements', description)
      formData.append('consent_printed_name', consentName)

      formData.append(
        'existing_attachments',
        JSON.stringify(files.filter((f) => f.uploaded && f.id).map((f) => ({ id: f.id, file_name: f.name })))
      )

      files.forEach((f) => {
        if (f.file) {
          formData.append('attachments', f.file)
        }
      })

      if (signatureFile) formData.append('signature', signatureFile)

      const res = await fetch('/api/nomination', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok && data.success) {
        showToast(data.message || 'Saved')
        if (action === 'submit') setTimeout(() => router.push('/nominators/dashboard'), 800)
        else setEditingId(data.id || null)
      } else {
        showToast(data?.message || 'Server error')
      }
    } catch (e) {
      console.error(e)
      showToast('Network or server error')
    } finally {
      setLoadingState(false)
    }
  }

  // UI
  return (
    <Section width="w-full" height="min-h-screen" alignment="items-start p-10">
      <div className="w-full mx-auto relative">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--maroon)] text-white text-sm px-4 py-2 rounded-md shadow">{toast}</div>
        )}

        <div className="flex justify-between items-center mb-10 my-2">
          <div>
            <h1 className="text-3xl font-bold">Nomination Form</h1>
            {readonly && <div className="text-sm text-[var(--dark-grey)]">Viewing (read-only)</div>}
          </div>
          <Button size="sm" variant="secondary" onClick={() => router.push('/nominators/dashboard')}>
            <div className="px-4 py-1">Back to Dashboard</div>
          </Button>
        </div>

        <Section width="w-full" height="auto" alignment="items-start p-10">
          <form className="space-y-8 w-full" onSubmit={(e) => e.preventDefault()}>
            {/* Category */}
            <div>
              <label className="block text-[15px] font-medium mb-2">Category</label>

              {readonly ? (
                <div className="w-full border border-[var(--outline-grey)] rounded-lg p-3 bg-[var(--light-grey)] text-sm text-[var(--dark-grey)]">
                  {category || '—'}
                </div>
              ) : (
                <Dropdown
                  displayText={category || "Select Category"}
                  options={[
                    { label: 'Non-Teaching Personnel (Junior and Industrial Level)', href: '#', onClick: () => setCategory('Non-Teaching Personnel (Junior and Industrial Level)') },
                    { label: 'Non-Teaching Personnel (Senior Level)', href: '#', onClick: () => setCategory('Non-Teaching Personnel (Senior Level)') },
                    { label: 'Non-Teaching Personnel (Non-Supervisory Level)', href: '#', onClick: () => setCategory('Non-Teaching Personnel (Non-Supervisory Level)') },
                  ]}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="nomineeName" label="Name of Nominee" placeholder="Full Name" value={nomineeName} onChange={setNomineeName} width="w-full" disabled={readonly} />
              <Input id="position" label="Position / Designation" placeholder="e.g. Admin Officer II" value={position} onChange={setPosition} width="w-full" disabled={readonly} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown label="Unit / Office / College" placeholder="Search Unit/Office/College" options={[
                { label: 'Select Unit/Office/College', href: '#' },
                { label: 'Office of the Dean', href: '#' },
                { label: 'College of Science and Mathematics', href: '#' },
                { label: 'Office of the Vice Chancellor for Academic Affairs', href: '#' },
                { label: 'Office of the Vice Chancellor for Administration', href: '#' },
                { label: 'HR Development Office (HRDO)', href: '#' },
                { label: 'Accounting Office', href: '#' },
                { label: 'Supply and Property Management Office (SPMO)', href: '#' },
                { label: 'IT Center', href: '#' },
                { label: 'College of Arts and Letters', href: '#' },
                { label: 'College of Engineering', href: '#' },
              ]} value={unitSearchText} onChange={setUnitSearchText} onSelect={(val) => { if (!readonly) setUnit(val) }} disabled={readonly} />
              <Input id="length" label="Length of Service with UP (Years)" placeholder="e.g. 10" value={length} type="number" onChange={handleLengthChange} width="w-full" disabled={readonly} />
            </div>

            <div>
              <label className="block text-[15px] font-medium mb-2">Brief description of the outstanding achievements of the Nominee (max 250 words)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={`w-full border border-[var(--outline-grey)] rounded-lg p-3 resize-none focus:ring-2 ${readonly ? 'bg-gray-100 cursor-not-allowed text-gray-500'  : 'focus:ring-[var(--maroon)]'}`} disabled={readonly} />
              <div className="text-right text-xs text-[var(--dark-grey)]">{descWords}/250 words</div>
            </div>

            {/* File Upload */}
            {!readonly && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white transition ${dragActive ? 'border-[var(--maroon)] bg-[var(--light-grey)]' : 'border-[var(--outline-grey)]'}`}
              >
                <Upload className="w-10 h-10 mb-3 text-[var(--dark-grey)]" />
                <p className="text-sm text-[var(--dark-grey)]">Drag your file(s) to start uploading</p>
                <p className="text-sm text-[var(--dark-grey)] mt-1">OR</p>

                <label className="mt-3 px-6 py-1.5 bg-white border-2 border-[var(--dark-blue)] text-[var(--dark-blue)] rounded-md cursor-pointer text-sm font-medium hover:bg-[var(--light-grey)]">
                  Browse files
                  <input type="file" multiple className="hidden" accept=".jpg,.png,.zip,.docx,.pdf" onChange={handleFileUpload} />
                </label>
              </div>
            )}
            

            {/* Attachments list (always visible; view-only buttons when readonly) */}
            <div className="mt-4">
              <label className="block text-[15px] font-medium mb-2">Attachments</label>
              {files.length === 0 ? (
                <div className="text-sm text-[var(--dark-grey)]">No attachments</div>
              ) : (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-[var(--outline-grey)] rounded-md px-3 py-2">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[var(--dark-grey)]" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{f.name || (f.file?.name) || 'Attachment'}</div>
                          <div className="text-xs text-[var(--dark-grey)]">{formatFileSize(f.size)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button type="button" className="text-sm text-[var(--dark-blue)] hover:underline" onClick={() => handleDownloadFile(f)}>Download</button>

                        {!readonly && (
                          <button type="button" className="text-sm text-[var(--maroon)] hover:underline flex items-center gap-1" onClick={() => handleRemoveFile(i)}>
                            <X className="w-4 h-4" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nominee Consent */}
            <div className="rounded-lg border border-[var(--outline-grey)] p-6 bg-white shadow-sm">
              <div className="text-[15px] font-semibold mb-2">Nominee Consent</div>
              <p className="text-[15px] mb-3">
                I give my consent for my name to be included in the list of qualified nominees and I am giving my consent for the HRDO to release to the nominating party the necessary documents needed for the nomination.
              </p>
              <p className="text-[15px]">Printed Name with Signature of the Nominee</p>

              {/* If signature exists, show preview (always visible) */}
              {signaturePreview && (
                <div className="mt-4 border border-[var(--outline-grey)] rounded-lg p-4 bg-white flex items-center justify-center">
                  <img
                    src={signaturePreview}
                    alt="Signature Preview"
                    className="max-h-64 object-contain rounded-md"
                  />
                </div>
              )}

              {/* Upload box ONLY when not readonly AND no signature yet */}
              {!readonly && !signaturePreview && (
                <div
                  onDrop={handleDropSignature}
                  onDragOver={handleSigDragOver}
                  onDragLeave={handleSigDragLeave}
                  className={`mt-4 border rounded-lg p-4 bg-white flex flex-col items-center justify-center text-center transition ${sigDragActive ? "border-[var(--maroon)] bg-[var(--light-grey)]" : "border-[var(--outline-grey)]"}`}
                  style={{ minHeight: 140 }}
                >
                  <p className="text-sm text-[var(--dark-grey)]">Drag or Upload Image (PNG or JPG)</p>

                  <label className="mt-3 px-6 py-1.5 bg-white border-2 border-[var(--dark-blue)] text-[var(--dark-blue)] rounded-md cursor-pointer text-sm font-medium hover:bg-[var(--light-grey)]">
                    Attach File
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.png"
                      onChange={handleSignatureUpload}
                    />
                  </label>
                </div>
              )}

              {/* File name + Remove button (only editable if not read-only) */}
              {signatureFile && (
                <div className="mt-3 flex items-center justify-between bg-[var(--light-grey)] rounded-md px-4 py-2">
                  <span className="text-sm text-[var(--dark-grey)] truncate">{signatureFile.name}</span>
                  {!readonly && (
                    <button
                      type="button"
                      className="text-sm text-[var(--maroon)] hover:underline flex items-center gap-1"
                      onClick={removeSignature}
                    >
                      <X className="w-4 h-4" /> Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Nominated By (disabled, bound to fname fetched from profile) */}
            <div>
              <label className="block text-[15px] font-medium mb-2">Nominated By</label>
              <input type="text" value={fname || 'Your Name'} disabled className="w-full bg-[var(--outline-grey)] border border-[var(--outline-grey)] rounded-lg p-3 cursor-not-allowed" />
            </div>

            {!readonly && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                id="consentName"
                label="Printed name for nominee consent"
                placeholder="Printed name"
                value={consentName}
                onChange={setConsentName}
                width="w-full"
                disabled={readonly}
              />
            </div>
          )}


            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              {!readonly && (
                <Button size="sm" variant="secondary" onClick={() => router.push('/nominators/dashboard')}>
                  <div className="px-4 py-2">Cancel</div>
                </Button>
              )}

              {!readonly && (
                <>
                  <Button size="sm" variant="secondary" onClick={() => submitToServer('save')} disabled={savingDraft}>
                    <div className="px-4 py-2">{savingDraft ? 'Saving...' : 'Save Draft'}</div>
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={submitting}
                  >
                    <div className="px-4 py-2">{submitting ? 'Submitting...' : 'Submit Nomination'}</div>
                  </Button>
                </>
              )}
            </div>
          </form>

          {showConfirmModal && (
            <ConfirmModal
              action="submitNomination"
              onCancelAction={() => setShowConfirmModal(false)}
              onConfirmAction={() => {
                setShowConfirmModal(false)
                submitToServer('submit')
              }}
            />
          )}
        </Section>

        {toast && (<div className="fixed bottom-5 right-5 bg-[var(--maroon)] text-white text-sm px-4 py-2 rounded-md shadow-md">{toast}</div>)}
      </div>
    </Section>
  )
}
