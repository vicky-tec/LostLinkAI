import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { claimAPI, foundAPI } from '../api'
import toast from 'react-hot-toast'
import {
  CheckCircle, XCircle, Clock, Send, Package,
  MapPin, FileText, User, Mail, MessageSquare, Loader2, Award, ClipboardCheck
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_CONFIG = {
  pending:  { label: 'Under Review',  badge: 'badge-yellow', icon: Clock },
  accepted: { label: 'Approved',     badge: 'badge-green',  icon: CheckCircle },
  rejected: { label: 'Rejected',     badge: 'badge-red',    icon: XCircle },
}

export default function Claims() {
  const location = useLocation()
  const preState = location.state || {}

  const [claims, setClaims] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [loadingClaims, setLoadingClaims] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    found_item_id: preState.found_item_id || '',
    lost_item_id: preState.lost_item_id || '',
    claimant_name: '',
    claimant_email: '',
    message: '',
  })

  useEffect(() => {
    Promise.all([claimAPI.list(), foundAPI.list()])
      .then(([cRes, fRes]) => {
        setClaims(cRes.data)
        setFoundItems(fRes.data)
      })
      .catch(() => toast.error('Failed to retrieve registries'))
      .finally(() => setLoadingClaims(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.found_item_id || !form.claimant_name || !form.claimant_email) {
      toast.error('Name, email, and selected item are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await claimAPI.submit({
        ...form,
        found_item_id: Number(form.found_item_id),
        lost_item_id: form.lost_item_id ? Number(form.lost_item_id) : null,
      })
      setClaims(prev => [res.data, ...prev])
      toast.success('Claim submitted successfully!')
      setForm({ found_item_id: '', lost_item_id: '', claimant_name: '', claimant_email: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Claim submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      await claimAPI.update(id, action)
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: action === 'accept' ? 'accepted' : 'rejected' } : c))
      toast.success(`Claim successfully ${action}ed!`)
    } catch {
      toast.error('Operation failed')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20">
      
      {/* Page Header */}
      <header className="page-header relative overflow-hidden rounded-2xl bg-surface-container-low/30 border border-border p-6 mb-8">
        <div className="absolute right-4 top-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="section-label mb-2">Item Verification Office</div>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-2 font-sora">
          Claim Requests
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Submit ownership validation details to reclaim a lost item. Finders and administrators can review your descriptions and authorize handovers securely.
        </p>
      </header>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Submit Claim Form */}
        <section className="lg:col-span-5 flex flex-col gap-4" aria-label="Ownership claim submission">
          <h2 className="font-sora font-bold text-on-surface text-base flex items-center gap-2 px-1">
            <Send size={16} className="text-primary" />
            File New Claim
          </h2>

          <form onSubmit={handleSubmit} id="claim-form" className="glass-card p-6 flex flex-col gap-4">
            
            {/* Found Item Selection Dropdown */}
            <div>
              <label htmlFor="claim-found-item" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                Select Found Item *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  inventory_2
                </span>
                <select
                  id="claim-found-item"
                  value={form.found_item_id}
                  onChange={e => setForm(f => ({ ...f, found_item_id: e.target.value }))}
                  className="input-field !pl-12 text-xs"
                  required
                >
                  <option value="">Select item matching description...</option>
                  {foundItems.map(fi => (
                    <option key={fi.id} value={fi.id}>
                      #{fi.id} — {fi.category} ({fi.location}) [{fi.status}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Claimant Name */}
            <div>
              <label htmlFor="claim-name" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                Your Full Name *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  person
                </span>
                <input
                  id="claim-name"
                  value={form.claimant_name}
                  onChange={e => setForm(f => ({ ...f, claimant_name: e.target.value }))}
                  placeholder="e.g. Chandan Kumar"
                  className="input-field !pl-12"
                  required
                />
              </div>
            </div>

            {/* Claimant Email */}
            <div>
              <label htmlFor="claim-email" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                Campus Email Address *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  alternate_email
                </span>
                <input
                  id="claim-email"
                  type="email"
                  value={form.claimant_email}
                  onChange={e => setForm(f => ({ ...f, claimant_email: e.target.value }))}
                  placeholder="e.g. rahul.kumar@iitp.ac.in"
                  className="input-field !pl-12"
                  required
                />
              </div>
            </div>

            {/* Proof text */}
            <div>
              <label htmlFor="claim-message" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                Proof details & features
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant text-base">
                  lock_open
                </span>
                <textarea
                  id="claim-message"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={4}
                  placeholder="Describe unique details (e.g. keychains quantity, names inside folders, stickers on laptops, wallpaper photo details)..."
                  className="input-field !pl-12 resize-none py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-claim-btn"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3.5 text-sm font-semibold mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Filing Claim...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={16} />
                  Submit Validation Claim
                </span>
              )}
            </button>
          </form>
        </section>

        {/* Right Side: Claims Lists */}
        <section className="lg:col-span-7 flex flex-col gap-4" aria-label="Claims log list">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-sora font-bold text-on-surface text-base flex items-center gap-2">
              <ClipboardCheck size={16} className="text-primary" />
              Active Claims Dashboard
            </h2>
            <span className="badge badge-primary text-[10px] font-bold">
              {claims.length} filed
            </span>
          </div>

          {loadingClaims ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
            </div>
          ) : claims.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed">
              <Clock size={32} className="text-on-surface-variant/40 mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant">No claims filed yet.</p>
            </div>
          ) : (
            <ul className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
              {claims.map(claim => {
                const sc = STATUS_CONFIG[claim.status] || STATUS_CONFIG.pending
                const StatusIcon = sc.icon
                return (
                  <li key={claim.id} className="glass-card p-5 border-border flex flex-col gap-4">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3">
                        {(() => {
                          const foundItem = foundItems.find(fi => fi.id === claim.found_item_id);
                          const imgUrl = foundItem && foundItem.image_path ? foundItem.image_path.replace('./', '/') : null;
                          return imgUrl ? (
                            <img src={imgUrl} alt="Claimed Item" className="w-12 h-12 object-cover rounded-xl border border-border flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-surface-container border border-border flex items-center justify-center text-on-surface-variant flex-shrink-0">
                              <Package size={18} />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface text-sm">{claim.claimant_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                            <Mail size={11} />
                            <span>{claim.claimant_email}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`badge ${sc.badge} flex items-center gap-1.5 text-[10px] font-bold`}>
                        <StatusIcon size={12} />
                        {sc.label}
                      </span>
                    </div>

                    {/* Meta ID tags */}
                    <div className="flex gap-2 pl-[60px] text-[10px] font-bold">
                      <span className="badge badge-secondary font-bold">Found Item ID #{claim.found_item_id}</span>
                      {claim.lost_item_id && (
                        <span className="badge badge-primary font-bold">Lost Item ID #{claim.lost_item_id}</span>
                      )}
                    </div>

                    {/* Proof Description Text */}
                    {claim.message && (
                      <div className="ml-[60px] p-3 rounded-xl bg-surface-container/60 border border-border flex gap-2">
                        <MessageSquare size={13} className="text-on-surface-variant/80 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {claim.message}
                        </p>
                      </div>
                    )}

                    {/* Recovery Timeline Graphic */}
                    <div className="ml-[60px] py-2 border-t border-border flex items-center justify-between gap-4 text-[10px] font-bold">
                      <div className="flex items-center gap-3 w-full max-w-sm">
                        
                        {/* Dot 1: Submitted */}
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-primary flex-shrink-0" />
                          <span className="text-on-surface text-[9px] uppercase">Submitted</span>
                        </div>

                        <div className="flex-1 h-0.5 bg-border rounded" />

                        {/* Dot 2: Verified */}
                        <div className="flex items-center gap-1">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            claim.status !== 'pending' ? 'bg-emerald-500' : 'bg-surface-container border border-outline'
                          }`} />
                          <span className="text-on-surface-variant text-[9px] uppercase">Reviewed</span>
                        </div>

                        <div className="flex-1 h-0.5 bg-border rounded" />

                        {/* Dot 3: Final State */}
                        <div className="flex items-center gap-1">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            claim.status === 'accepted' ? 'bg-emerald-500' : claim.status === 'rejected' ? 'bg-rose-500' : 'bg-surface-container border border-outline'
                          }`} />
                          <span className="text-on-surface-variant text-[9px] uppercase">
                            {claim.status === 'rejected' ? 'Rejected' : 'Returned'}
                          </span>
                        </div>

                      </div>

                      <span className="text-[10px] text-on-surface-variant/80 shrink-0 font-medium">
                        {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Action Verification Controls */}
                    {claim.status === 'pending' && (
                      <div className="border-t border-border pt-4 flex justify-end gap-3">
                        <button
                          id={`reject-claim-${claim.id}`}
                          onClick={() => handleAction(claim.id, 'reject')}
                          className="btn-danger text-xs font-semibold py-2 px-4 inline-flex items-center gap-1.5"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          id={`accept-claim-${claim.id}`}
                          onClick={() => handleAction(claim.id, 'accept')}
                          className="btn-success text-xs font-semibold py-2 px-4 inline-flex items-center gap-1.5 text-white bg-emerald-600 border-none"
                        >
                          <CheckCircle size={14} /> Approve Handover
                        </button>
                      </div>
                    )}

                  </li>
                )
              })}
            </ul>
          )}
        </section>

      </div>

    </div>
  )
}
