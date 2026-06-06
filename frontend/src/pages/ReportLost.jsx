import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { lostAPI, matchAPI } from '../api'
import toast from 'react-hot-toast'
import {
  AlertCircle, MapPin, Calendar, FileText,
  Loader2, Zap, GitCompare, CheckCircle, Tag,
  Image as ImageIcon, X, Sparkles, Phone, ShieldAlert
} from 'lucide-react'
import { Link } from 'react-router-dom'

const CAMPUS_LOCATIONS = [
  'Central Library', 'Hostel-1', 'Hostel-2', 'Hostel-3', 'Hostel-4',
  'Main Canteen', 'Academic Block A', 'Academic Block B',
  'Computer Lab-1', 'Computer Lab-2', 'Sports Ground', 'Main Gate',
  'Admin Block', 'Seminar Hall', 'EC Department', 'CS Department',
  'Mechanical Dept', 'Medical Center', 'Basketball Court', 'Gym',
]

const SUGGESTIONS = [
  'Lost black JBL earbuds near Central Library',
  'Missing my ID card — Chandan Kumar, CS dept',
  'Brown leather wallet lost in Hostel-3 mess',
  'White Anker USB-C charger left in Computer Lab',
]

function ScoreBar({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'var(--color-tertiary)' : pct >= 60 ? 'var(--color-primary)' : 'var(--color-secondary)'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  )
}

export default function ReportLost() {
  const [form, setForm] = useState({
    title: '', description: '', location: '', date_lost: new Date().toISOString().split('T')[0], phone: ''
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [matching, setMatching] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [matches, setMatches] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onDrop = useCallback(accepted => {
    if (accepted[0]) {
      setFile(accepted[0])
      setPreview(URL.createObjectURL(accepted[0]))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in title and description')
      return
    }

    setSubmitting(true)

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('location', form.location)
    formData.append('date_lost', form.date_lost)
    if (form.phone) formData.append('contact_phone', form.phone)
    if (file) formData.append('image', file)

    try {
      const res = await lostAPI.report(formData)
      setSubmitted(res.data)
      toast.success('Lost item reported successfully!')

      // Auto-run matching
      setMatching(true)
      try {
        const matchRes = await matchAPI.run(res.data.id)
        setMatches(matchRes.data)
      } catch {
        toast.error('Matching evaluation failed')
      } finally {
        setMatching(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuggestionClick = (desc) => {
    const title = desc.split(' ').slice(0, 4).join(' ')
    setForm(f => ({ ...f, description: desc, title }))
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-on-surface font-sora">Lost Report Logged!</h1>
          <p className="text-sm text-on-surface-variant mt-1.5">Lost Item Record #{submitted.id} · Querying semantic index</p>
        </div>

        {/* Submitted item summary */}
        <div className="glass-card p-5 mb-8 border-primary/20">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Your Report Description</span>
              <h2 className="font-bold text-on-surface text-lg mt-1 mb-2">{submitted.title}</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">{submitted.description}</p>
            </div>
            
            <div className="flex flex-col gap-2 items-end flex-shrink-0 text-xs">
              <span className="badge badge-purple flex items-center gap-1">
                <MapPin size={10} /> {submitted.location || 'Anywhere'}
              </span>
              <span className="badge badge-blue flex items-center gap-1">
                <Calendar size={10} /> {submitted.date_lost}
              </span>
              {submitted.contact_phone && (
                <span className="badge badge-green flex items-center gap-1">
                  <Phone size={10} /> {submitted.contact_phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Match Analysis */}
        {matching && (
          <div className="glass-card p-8 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-primary animate-spin" />
            <h3 className="font-sora font-semibold text-on-surface">Running AI Matching...</h3>
            <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
              Evaluating categories, analyzing color hashes, and parsing OCR texts with Gemini vectors.
            </p>
          </div>
        )}

        {matches && (
          <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-sora font-bold text-on-surface flex items-center gap-2">
                <GitCompare size={18} className="text-primary" />
                Live Matching Results
              </h3>
              <span className="badge badge-purple">
                {matches.matches_found} candidate{matches.matches_found !== 1 ? 's' : ''} matched
              </span>
            </div>

            {matches.matches.length === 0 ? (
              <div className="text-center py-8">
                <ShieldAlert size={36} className="text-on-surface-variant/40 mx-auto mb-2" />
                <p className="text-on-surface font-semibold text-sm">No initial matches detected</p>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Finders will scan items soon. If a match score crosses 60%, a match alert will generate automatically.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.matches.map((m, idx) => (
                  <li key={m.match_id} className="rounded-2xl border border-border bg-surface-container-low p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase">Candidate #{idx + 1}</span>
                          <h4 className="font-bold text-on-surface mt-0.5 text-sm">{m.found_item.category}</h4>
                        </div>
                        {m.found_item.brand && (
                          <span className="badge badge-blue text-[10px]">{m.found_item.brand}</span>
                        )}
                      </div>

                      <ScoreBar score={m.score} />

                      {/* Reasoning statement */}
                      <div className="mt-4 p-3 rounded-xl bg-primary-container border border-primary/20 flex gap-2">
                        <Zap size={13} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-primary-container leading-relaxed">
                          {m.reason}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                        <span className="badge badge-purple flex items-center gap-1">
                          <MapPin size={9} /> {m.found_item.location}
                        </span>
                        {m.found_item.contact_phone && (
                          <span className="badge badge-green flex items-center gap-1">
                            <Phone size={9} /> {m.found_item.contact_phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex justify-end">
                      <Link
                        to="/claims"
                        state={{ found_item_id: m.found_item_id, lost_item_id: submitted.id }}
                        className="btn-success text-xs py-1.5 px-3"
                      >
                        <CheckCircle size={12} /> Claim This Item
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Option Action CTAs */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              setSubmitted(null); setMatches(null); setFile(null); setPreview(null);
              setForm({ title: '', description: '', location: '', date_lost: new Date().toISOString().split('T')[0], phone: '' })
            }}
            className="btn-secondary flex-1 justify-center py-3"
          >
            File Another Report
          </button>
          
          <Link to="/matches" className="btn-primary flex-1 justify-center py-3">
            <GitCompare size={16} /> View Match Center
          </Link>
        </div>

      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20">
      
      {/* ── Page Header ──────────────────────── */}
      <header className="page-header relative overflow-hidden rounded-2xl bg-surface-container-low/30 border border-border p-6 mb-8">
        <div className="absolute right-4 top-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="section-label mb-2">Campus Lost Registries</div>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-2 font-sora">
          Report a Lost Item
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Describe the details of the item you misplaced. Our database will track it and perform real-time semantic analysis to identify matching uploads.
        </p>
      </header>

      {/* Suggestion pill examples */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">
          Quick-Fill suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="text-xs px-3.5 py-2 rounded-full bg-surface-container border border-border text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-medium"
            >
              {s.slice(0, 36)}...
            </button>
          ))}
        </div>
      </div>

      {/* Lost Submission Form */}
      <form onSubmit={handleSubmit} id="lost-item-form" className="glass-card p-6 flex flex-col gap-5">
        
        {/* Name Title */}
        <div>
          <label htmlFor="lost-title" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
            Item Label *
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              tag
            </span>
            <input
              id="lost-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Navy Blue Leather Key Organizer"
              className="input-field !pl-12"
              required
            />
          </div>
        </div>

        {/* Detailed Paragraph Description */}
        <div>
          <label htmlFor="lost-description" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
            Details & Markings *
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant text-base">
              description
            </span>
            <textarea
              id="lost-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe color scheme, brand logos, tags, serial engravings, mesh, scratch spots, or content details inside (keys quantity)..."
              className="input-field !pl-12 resize-none py-3"
              required
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[10px] text-on-surface-variant font-medium">
            <span>{form.description.length} characters</span>
            <span>Aim for 40+ characters for accurate matches</span>
          </div>
        </div>

        {/* Image upload (Optional) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
            Reference Picture (Optional)
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : preview
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-border hover:border-primary hover:bg-surface-container'
            }`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative max-w-xs mx-auto">
                <img src={preview} alt="Upload preview" className="max-h-24 object-contain rounded-lg mx-auto border border-border" />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-surface-container-highest border border-border text-on-surface"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-xs font-bold text-on-surface">Drag reference image here or click</p>
                <p className="text-[10px] text-on-surface-variant">Helps finders visually verify your claim</p>
              </div>
            )}
          </div>
        </div>

        {/* Location + Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lost-location" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
              Last Seen Location
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                pin_drop
              </span>
              <select
                id="lost-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input-field !pl-12"
              >
                <option value="">Choose location...</option>
                {CAMPUS_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="lost-date" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
              Date Misplaced
            </label>
            <input
              id="lost-date"
              name="date_lost"
              type="date"
              value={form.date_lost}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="lost-phone" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
            Your Phone (Optional)
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              phone
            </span>
            <input
              id="lost-phone"
              name="phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              className="input-field !pl-12"
            />
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5">
            Will be shared securely with verified matching finders.
          </p>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          id="submit-lost-btn"
          disabled={submitting}
          className="btn-primary justify-center py-3.5 text-sm font-semibold w-full disabled:opacity-50 mt-2"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Submitting entry...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles size={16} />
              Submit Report & Search Matches
            </span>
          )}
        </button>

      </form>

    </div>
  )
}
