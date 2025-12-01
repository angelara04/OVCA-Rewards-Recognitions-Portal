// Reworked client component to integrate with server endpoints:
//  - GET  /api/profile           -> returns logged in user's name
//  - POST /api/nomination        -> proxies formdata to server createOrUpdateNomination

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Section from '@/components/section'
import Button from '@/components/button'
import Input from '@/components/input'
import Dropdown from '@/components/dropdown'
import SearchableDropdown from '@/components/searchable-dropdown'
import ConfirmModal from '@/components/confirm-modal'
import { Upload, FileText, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UploadedFile {
  file: File
  uploaded: boolean
}

export default function Page() {
  const router = useRouter()
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
  const [fname, setFname] = useState('') // single source of truth for fetched name
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)



  useEffect(() => {
    const words = description.trim() === '' ? 0 : description.trim().split(/\s+/).length
    setDescWords(words)
  }, [description])

  useEffect(() => {
    if (unit) setUnitSearchText(unit)
  }, [unit])

  // Fetch logged-in user's profile name from server endpoint (single effect)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          if (data?.name) setFname(data.name)
        }
      } catch (e) {
        // ignore - keep placeholder
        console.error(e)
      }
    })()
  }, [])

  const categoryOptions = [
    { label: 'Select Category', href: '#' },
    { label: 'Non-Teaching Personnel (Junior and Industrial Level)', href: '#' },
    { label: 'Non-Teaching Personnel (Senior Level)', href: '#' },
    { label: 'Non-Teaching Personnel (Non-Supervisory Level)', href: '#' },
  ]

  const officeOptions = [
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
  ]

  const acceptedTypes = ['.jpg', '.png', '.zip', '.docx', '.pdf']

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const processFiles = (selected: File[]) => {
    const valid = selected.filter((file) =>
      acceptedTypes.some((ext) => file.name.toLowerCase().endsWith(ext))
    )
    if (valid.length < selected.length) showToast('Some files were rejected (unsupported type)')

    const newFiles = valid.map((f) => ({ file: f, uploaded: false }))
    setFiles((prev) => [...prev, ...newFiles])

    // mark as "uploaded" locally
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
    setDragActive(false)
    processFiles(Array.from(e.dataTransfer.files))
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file)
    window.open(url, '_blank')
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
    setSigDragActive(true)
  }

  const handleSigDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setSigDragActive(false)
  }

  const removeSignature = () => {
    setSignatureFile(null)
    setSignaturePreview(null)
  }

  const handleLengthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '')
    if (numericValue === '' || /^\d+(\.\d*)?$/.test(numericValue)) {
      setLength(numericValue)
    }
  }

  // Build FormData and POST to server route app/api/nomination
 async function submitToServer(action: 'save' | 'submit') {
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
    formData.append('category', '')
    formData.append('nominee_name', nomineeName)
    formData.append('position', position)
    formData.append('unit', unit)
    formData.append('length_of_service', length)
    formData.append('achievements', description)
    formData.append('consent_printed_name', consentName)

    files.forEach((f) => formData.append('attachments', f.file))
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


  return (
    <Section width="w-full" height="min-h-screen" alignment="items-start p-10">
      <div className="w-full mx-auto relative">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--maroon)] text-white text-sm px-4 py-2 rounded-md shadow">{toast}</div>
        )}

        <div className="flex justify-between items-center mb-10 my-2">
          <h1 className="text-3xl font-bold">Nomination Form</h1>
          <Button size="sm" variant="secondary" onClick={() => router.push('/nominators/dashboard')}>
            <div className="px-4 py-1">Back to Dashboard</div>
          </Button>
        </div>

        <Section width="w-full" height="auto" alignment="items-start p-10">
          <form className="space-y-8 w-full" onSubmit={(e) => e.preventDefault()}>
            {/* Category */}
            <div>
              <label className="block text-[15px] font-medium mb-2">Category</label>
              <Dropdown displayText="Select Category" options={categoryOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="nomineeName" label="Name of Nominee" placeholder="Full Name" value={nomineeName} onChange={setNomineeName} width="w-full" />
              <Input id="position" label="Position / Designation" placeholder="e.g. Admin Officer II" value={position} onChange={setPosition} width="w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown label="Unit / Office / College" placeholder="Search Unit/Office/College" options={officeOptions} value={unitSearchText} onChange={setUnitSearchText} onSelect={setUnit} />
              <Input id="length" label="Length of Service with UP (Years)" placeholder="e.g. 10" value={length} type="number" onChange={handleLengthChange} width="w-full" />
            </div>

            <div>
              <label className="block text-[15px] font-medium mb-2">Brief description of the outstanding achievements of the Nominee (max 250 words)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full border border-[var(--outline-grey)] rounded-lg p-3 resize-none focus:ring-2 focus:ring-[var(--maroon)]" />
              <div className="text-right text-xs text-[var(--dark-grey)]">{descWords}/250 words</div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-[15px] font-medium mb-2">You may attach Nomination Letter, CV, and Supporting Certificates</label>

              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white transition ${dragActive ? 'border-[var(--maroon)] bg-[var(--light-grey)]' : 'border-[var(--outline-grey)]'}`}>
                <Upload className="w-10 h-10 mb-3 text-[var(--dark-grey)]" />
                <p className="text-sm text-[var(--dark-grey)]">Drag your file(s) to start uploading</p>
                <p className="text-sm text-[var(--dark-grey)] mt-1">OR</p>
                <label className="mt-3 px-6 py-1.5 bg-white border-2 border-[var(--dark-blue)] text-[var(--dark-blue)] rounded-md cursor-pointer text-sm font-medium hover:bg-[var(--light-grey)]">
                  Browse files
                  <input type="file" multiple className="hidden" accept=".jpg,.png,.zip,.docx,.pdf" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="flex justify-between mt-2 text-xs text-[var(--dark-grey)]">
                <p>Supported file formats: jpg, png, zip, docx, pdf</p>
                <p>Max size: 10MB</p>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between border border-[var(--outline-grey)] bg-white rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[var(--dark-grey)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--dark-grey)]">{entry.file.name}</p>
                          <p className="text-xs text-[var(--dark-grey)]">{formatFileSize(entry.file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {entry.uploaded && (<span className="text-xs bg-[var(--light-green)] text-[var(--dark-green)] px-3 py-1.5 rounded-md font-medium">Uploaded</span>)}
                        <Button size="sm" variant="view" type="button" onClick={() => handleViewFile(entry.file)}><div className="px-3 py-0.5">View</div></Button>
                        <button type="button" onClick={() => handleRemoveFile(index)} className="text-[var(--maroon)] cursor-pointer"><X className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nominee Consent */}
            <div className="rounded-lg border border-[var(--outline-grey)] p-6 bg-white shadow-sm">
              <div className="text-[15px] font-semibold mb-2">Nominee Consent</div>
              <p className="text-[15px] mb-3">I give my consent for my name to be included in the list of qualified nominees and I am giving my consent for the HRDO to release to the nominating party the necessary documents needed for the nomination.</p>
              <p className="text-[15px]">Printed Name with Signature of the Nominee</p>

              <div onDrop={handleDropSignature} onDragOver={handleSigDragOver} onDragLeave={handleSigDragLeave} className={`mt-4 border rounded-lg p-4 bg-white flex flex-col items-center justify-center text-center overflow-hidden transition ${sigDragActive ? 'border-[var(--maroon)] bg-[var(--light-grey)]' : 'border-[var(--outline-grey)]'}`} style={{ minHeight: 140 }}>
                {signaturePreview ? (
                  <img src={signaturePreview} alt="Signature Preview" className="max-h-64 object-contain rounded-md" />
                ) : (
                  <>
                    <p className="text-sm text-[var(--dark-grey)]">Drag or Upload Image (PNG or JPG)</p>
                    <label className="mt-3 px-6 py-1.5 bg-white border-2 border-[var(--dark-blue)] text-[var(--dark-blue)] rounded-md cursor-pointer text-sm font-medium hover:bg-[var(--light-grey)]">
                      Attach File
                      <input type="file" className="hidden" accept=".jpg,.png" onChange={handleSignatureUpload} />
                    </label>
                  </>
                )}
              </div>

              {signatureFile && (
                <div className="mt-3 flex items-center justify-between bg-[var(--light-grey)] rounded-md px-4 py-2">
                  <span className="text-sm text-[var(--dark-grey)] truncate">{signatureFile.name}</span>
                  <button type="button" className="text-sm text-[var(--maroon)] hover:underline flex items-center gap-1" onClick={removeSignature}><X className="w-4 h-4" /> Remove</button>
                </div>
              )}
            </div>

            {/* Nominated By (disabled, bound to fname fetched from profile) */}
            <div>
              <label className="block text-[15px] font-medium mb-2">Nominated By</label>
              <input type="text" value={fname || 'Your Name'} disabled className="w-full bg-[var(--outline-grey)] border border-[var(--outline-grey)] rounded-lg p-3 cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input id="consentName" label="Printed name for nominee consent" placeholder="Printed name" value={consentName} onChange={setConsentName} width="w-full" />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <Button size="sm" variant="secondary" onClick={() => router.push('/nominators/dashboard')}>
                <div className="px-4 py-2">Cancel</div>
              </Button>
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
