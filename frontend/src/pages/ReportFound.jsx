import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { foundAPI } from '../api'
import toast from 'react-hot-toast'
import {
  Upload, Image as ImageIcon, Cpu, MapPin, FileText,
  CheckCircle, Loader2, Sparkles, Eye, X, Copy, Tag, Compass
} from 'lucide-react'

const CAMPUS_LOCATIONS = [
  'Central Library', 'Hostel-1', 'Hostel-2', 'Hostel-3', 'Hostel-4',
  'Main Canteen', 'Academic Block A', 'Academic Block B',
  'Computer Lab-1', 'Computer Lab-2', 'Sports Ground', 'Main Gate',
  'Admin Block', 'Seminar Hall', 'EC Department', 'CS Department',
  'Mechanical Dept', 'Medical Center', 'Basketball Court', 'Gym',
]

const CATEGORY_ICONS = {
  'ID Card': '🪪',
  'Wallet': '👛',
  'Keys': '🔑',
  'Earphones/Headphones': '🎧',
  'Charger': '🔌',
  'Book/Notebook': '📓',
  'Water Bottle': '🧴',
  'Bag/Backpack': '🎒',
  'Phone': '📱',
  'Glasses': '👓',
  'Document': '📄',
  'Electronics': '💻',
  'Other': '📦',
}

export default function ReportFound() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [stage, setStage] = useState('')

  const onDrop = useCallback(accepted => {
    if (accepted[0]) {
      setFile(accepted[0])
      setPreview(URL.createObjectURL(accepted[0]))
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!location) { toast.error('Please select a location'); return }

    const formData = new FormData()
    formData.append('location', location)
    if (phone) formData.append('contact_phone', phone)
    if (file) formData.append('image', file)

    setLoading(true)
    setResult(null)

    const stages = [
      { msg: '🤖 Initializing Gemini Multi-modal pipeline...', delay: 0 },
      { msg: '🔍 Analyzing image details and colors...', delay: 800 },
      { msg: '📝 Scanning text labels (Google OCR API)...', delay: 1800 },
      { msg: '🧠 Calculating vector embedding vectors...', delay: 2800 },
      { msg: '💾 Writing secure record entry to database...', delay: 3800 },
    ]

    let stageIdx = 0
    const advanceStage = () => {
      if (stageIdx < stages.length) {
        setStage(stages[stageIdx].msg)
        stageIdx++
      }
    }
    
    advanceStage()
    const timer = setInterval(() => {
      advanceStage()
      if (stageIdx >= stages.length) clearInterval(timer)
    }, 1000)

    try {
      const res = await foundAPI.report(formData)
      clearInterval(timer)
      setResult(res.data)
      setStage('')
      toast.success('Found item reported successfully!')
    } catch (err) {
      clearInterval(timer)
      setStage('')
      toast.error(err.response?.data?.detail || 'Failed to submit. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const copyOCR = () => {
    if (result?.ocr_text) {
      navigator.clipboard.writeText(result.ocr_text)
      toast.success('Text copied to clipboard!')
    }
  }

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setLocation(''); setPhone(''); setStage('')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20">
      
      {/* ── Page Header ──────────────────────── */}
      <header className="page-header relative overflow-hidden rounded-2xl bg-surface-container-low/30 border border-border p-6 mb-8">
        <div className="absolute right-4 top-4 w-32 h-32 bg-tertiary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="section-label mb-2">Google Gemini AI Engine</div>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-2 font-sora">
          Report a Found Item
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Upload an image of the item you found. Our multi-modal vision AI will automatically identify the object, read serial numbers or names via OCR, and index it for matching.
        </p>
      </header>

      {/* ── Main Layout Split ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column - Left */}
        <section className="lg:col-span-7 flex flex-col gap-6" aria-label="Found item submission form">
          
          <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-6" id="found-item-form">
            
            {/* Image Upload Zone */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-3">
                Item Photograph *
              </label>
              
              <div
                {...getRootProps()}
                id="image-dropzone"
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-primary bg-primary/5 shadow-glow-primary'
                    : preview
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border hover:border-primary hover:bg-surface-container'
                }`}
              >
                <input {...getInputProps()} id="image-input" />
                
                {preview ? (
                  <div className="relative max-w-sm mx-auto group">
                    <div className="relative overflow-hidden rounded-xl border border-border">
                      <img src={preview} alt="Found item preview" className="w-full max-h-64 object-contain mx-auto" />
                      {loading && <div className="absolute inset-0 bg-black/40 scan-effect" />}
                    </div>
                    
                    {!loading && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                        className="absolute -top-2.5 -right-2.5 p-1.5 rounded-full bg-surface-container-highest border border-border text-on-surface hover:scale-105 transition-transform"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    )}
                    
                    {!loading && (
                      <p className="text-xs text-emerald-400 font-medium mt-3 flex items-center justify-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-400" />
                        Ready to scan item
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto shadow-inner">
                      <Upload size={24} className="text-primary animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Drag & drop item photo or browse</p>
                      <p className="text-xs text-on-surface-variant mt-1">Supports JPG, PNG, WebP · Up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields: Location + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="found-location" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                  Discovery Location *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    pin_drop
                  </span>
                  <select
                    id="found-location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="input-field !pl-12"
                    required
                  >
                    <option value="">Choose location...</option>
                    {CAMPUS_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="found-phone" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                  Your Phone (Optional)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    phone
                  </span>
                  <input
                    id="found-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-field !pl-12"
                  />
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              id="submit-found-btn"
              disabled={loading || !file}
              className="btn-primary justify-center py-3.5 w-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Gemini Evaluating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Analyze Photo & File Report
                </span>
              )}
            </button>

          </form>

          {/* Active Terminal Scan Log Overlay */}
          {loading && stage && (
            <div className="glass-card p-5 border-primary/20 bg-primary/5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-primary animate-spin" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">AI Execution Log</h4>
              </div>
              <pre className="text-xs font-mono bg-surface-container-low p-4 rounded-xl text-on-surface-variant overflow-x-auto">
                <span className="text-primary">antigravity@gemini-vision:~$ </span>{stage}
              </pre>
              <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full animate-shimmer" style={{ width: '80%' }} />
              </div>
            </div>
          )}

        </section>

        {/* AI Results Side Container - Right */}
        <aside className="lg:col-span-5" aria-label="AI Analysis result preview">
          
          {/* Empty State */}
          {!result && !loading && (
            <div className="glass-card p-8 min-h-[460px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mb-4 shadow-sm animate-pulse-slow">
                <Sparkles size={24} className="text-tertiary" />
              </div>
              <h3 className="font-sora font-bold text-on-surface mb-2">AI Analysis Engine</h3>
              <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-6">
                Upload a photo on the left. The result block will generate full attributes automatically once submitted.
              </p>

              {/* Sample parameters box */}
              <div className="w-full text-left p-4 rounded-2xl bg-surface-container border border-border flex flex-col gap-3">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Example Visual Parameters</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5"><Tag size={12} /> Category: ID Card</div>
                  <div className="flex items-center gap-1.5"><Compass size={12} /> Location: Library</div>
                  <div className="flex items-center gap-1.5"><Eye size={12} /> Color: Navy Blue</div>
                  <div className="flex items-center gap-1.5"><FileText size={12} /> Name: Chandan K</div>
                </div>
              </div>
            </div>
          )}

          {/* Filled State: AI Results Card */}
          {result && (
            <div className="glass-card p-6 flex flex-col gap-5 border-emerald-500/20 bg-emerald-500/5">
              
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-400" />
                  <h3 className="font-sora font-bold text-on-surface text-base">Gemini Report Created</h3>
                </div>
                <button
                  onClick={reset}
                  className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  Submit Another
                </button>
              </div>

              {/* Category Showcase Banner */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-container border border-primary/20">
                <span className="text-4xl block leading-none" role="img" aria-label={result.category}>
                  {CATEGORY_ICONS[result.category] || '📦'}
                </span>
                <div>
                  <p className="text-[10px] font-bold text-primary-container uppercase tracking-wider">Detected category</p>
                  <p className="text-lg font-extrabold text-on-surface mt-0.5">{result.category}</p>
                </div>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  AI Verified
                </span>
              </div>

              {/* Description */}
              {result.ai_description && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Eye size={12} /> Detailed Description
                  </div>
                  <div className="text-xs text-on-surface bg-surface-container rounded-xl p-3.5 leading-relaxed">
                    {result.ai_description}
                  </div>
                </div>
              )}

              {/* OCR Text */}
              {result.ocr_text && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><FileText size={12} /> Extracted Text (OCR)</span>
                    <button
                      onClick={copyOCR}
                      className="text-primary hover:text-tertiary flex items-center gap-1 transition-colors"
                      title="Copy text"
                    >
                      <Copy size={11} />
                      Copy
                    </button>
                  </div>
                  <div className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 break-all max-h-24 overflow-y-auto">
                    {result.ocr_text}
                  </div>
                </div>
              )}

              {/* Parameter Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {result.color && (
                  <div className="p-3.5 rounded-xl bg-surface-container">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Color</p>
                    <p className="font-semibold text-on-surface">{result.color}</p>
                  </div>
                )}
                {result.brand && (
                  <div className="p-3.5 rounded-xl bg-surface-container">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Brand</p>
                    <p className="font-semibold text-on-surface">{result.brand}</p>
                  </div>
                )}
                <div className="p-3.5 rounded-xl bg-surface-container">
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Location</p>
                  <p className="font-semibold text-on-surface">{result.location}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container">
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Database ID</p>
                  <p className="font-semibold text-on-surface">#{result.id}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 text-center">
                <p className="text-[10px] text-on-surface-variant font-medium">
                  Item indexed. Evaluating active lost matches...
                </p>
              </div>

            </div>
          )}

        </aside>

      </div>

    </div>
  )
}
