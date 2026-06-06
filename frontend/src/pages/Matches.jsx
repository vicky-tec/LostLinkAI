import { useEffect, useState } from 'react'
import { matchAPI, lostAPI, foundAPI } from '../api'
import toast from 'react-hot-toast'
import {
  GitCompare, Zap, Loader2, RefreshCw, MapPin,
  Calendar, Tag, FileText, CheckCircle, Package, HelpCircle, Phone, ArrowRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

const getImageUrl = (path) => path ? path.replace('./', '/') : null

function ScoreRing({ score }) {
  const pct = Math.round(score)
  const color = pct >= 80 ? 'var(--color-tertiary)' : pct >= 60 ? 'var(--color-primary)' : 'var(--color-secondary)'
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative w-14 h-14 flex-shrink-0 animate-float">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-surface-container)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{pct}%</span>
      </div>
    </div>
  )
}

export default function Matches() {
  const [lostItems, setLostItems] = useState([])
  const [selectedLostId, setSelectedLostId] = useState(null)
  const [matches, setMatches] = useState(null)
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [allMatches, setAllMatches] = useState([])

  const loadInitialData = () => {
    setLoading(true)
    Promise.all([lostAPI.list(), matchAPI.listAll()])
      .then(([lostRes, matchRes]) => {
        setLostItems(lostRes.data)
        setAllMatches(matchRes.data)
      })
      .catch(() => toast.error('Failed to load. Is FastAPI backend running?'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const runMatch = async (lostId) => {
    setSelectedLostId(lostId)
    setRunning(true)
    setMatches(null)
    try {
      const res = await matchAPI.run(lostId)
      setMatches(res.data)
      toast.success(`Generated ${res.data.matches_found} candidate matches!`)
    } catch {
      toast.error('AI match retrieval failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20">
      
      {/* Page Header */}
      <header className="page-header relative overflow-hidden rounded-2xl bg-surface-container-low/30 border border-border p-6 mb-8">
        <div className="absolute right-4 top-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="section-label mb-2">Gemini Vector Indexer</div>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-2 font-sora">
          AI Match Engine
        </h1>
        <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
          Retrieve real-time semantic matches between campus listings. Select an active lost item below to compute multi-modal vector similarity against all cataloged findings.
        </p>
      </header>

      {/* Grid Layout: Left: Lost list (spans 2), Right: Matches workspace (spans 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Side: Lost Reports list */}
        <aside className="lg:col-span-2 flex flex-col gap-4" aria-label="Active lost reports">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-sora font-bold text-on-surface text-base flex items-center gap-2">
              <Package size={16} className="text-primary" />
              Active Lost Reports
            </h2>
            <span className="badge badge-primary text-[10px] font-bold">
              {lostItems.length} listed
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : lostItems.length === 0 ? (
            <div className="glass-card p-6 text-center border-dashed">
              <HelpCircle size={28} className="text-on-surface-variant/40 mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant">No lost items registered on campus yet.</p>
              <Link to="/report-lost" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">
                File a lost report &rarr;
              </Link>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {lostItems.map(item => (
                <li key={item.id}>
                  <button
                    id={`match-btn-${item.id}`}
                    onClick={() => runMatch(item.id)}
                    disabled={running}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                      selectedLostId === item.id
                        ? 'border-primary bg-primary-container/20 shadow-glow-primary'
                        : 'glass-card hover:border-primary/40'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      
                      {/* Image Preview thumbnail */}
                      {item.image_path ? (
                        <img
                          src={getImageUrl(item.image_path)}
                          alt="Lost item"
                          className="w-14 h-14 object-cover rounded-xl border border-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0 border border-border">
                          <Package size={20} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-on-surface text-sm truncate">{item.title}</p>
                          <span className="text-[10px] font-bold text-on-surface-variant/80 font-mono">#{item.id}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant truncate">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-1.5 text-[9px] font-bold">
                          <span className="badge badge-blue flex items-center gap-1">
                            <MapPin size={8} /> {item.location || 'Anywhere'}
                          </span>
                          <span className="badge badge-secondary flex items-center gap-1">
                            <Calendar size={8} /> {item.date_lost}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {running && selectedLostId === item.id ? (
                          <Loader2 size={16} className="text-primary animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-primary text-xl hover:scale-110 transition-transform">
                            chevron_right
                          </span>
                        )}
                      </div>

                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Right Side: Matches workspace */}
        <main className="lg:col-span-3 flex flex-col gap-6" aria-label="Matches analysis workbench">
          
          {/* Empty state: Select an item */}
          {!selectedLostId && !loading && (
            <div className="glass-card p-12 text-center min-h-[450px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 shadow-sm animate-pulse-slow">
                <GitCompare size={36} className="text-primary" />
              </div>
              <h3 className="font-sora font-bold text-on-surface text-lg mb-2">Select Lost Item</h3>
              <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                Click on any reported lost item in the registry list on the left. Gemini will process similarity indices and generate a structured reasoning card.
              </p>
            </div>
          )}

          {/* Running Match loader */}
          {running && (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-5">
              <div className="relative w-16 h-16">
                <Loader2 size={64} className="text-primary animate-spin" />
                <Zap size={24} className="text-tertiary absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-on-surface text-base mb-1">Calculating Vector Similarities</h3>
                <p className="text-xs text-on-surface-variant">Running cosine distance matchers and text OCR filters...</p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary flex items-center justify-center gap-1">
                  Embeddings
                </div>
                <div className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary flex items-center justify-center gap-1">
                  Text OCR
                </div>
                <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-secondary flex items-center justify-center gap-1">
                  Context Gen
                </div>
              </div>
            </div>
          )}

          {/* Matches lists outputs */}
          {matches && !running && (
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-sora font-bold text-on-surface text-lg">AI Recommendations</h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Found {matches.matches_found} candidate{matches.matches_found !== 1 ? 's' : ''} matching lost item #{selectedLostId}
                  </p>
                </div>
                
                <button
                  onClick={() => runMatch(selectedLostId)}
                  className="btn-secondary text-xs py-1.5 px-3"
                  id="rerun-match-btn"
                >
                  <RefreshCw size={12} className="mr-1" />
                  Recalculate
                </button>
              </div>

              {matches.matches.length === 0 ? (
                <div className="glass-card p-10 text-center border-dashed">
                  <Package size={36} className="text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-on-surface">No visual or text overlaps detected</p>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto mt-2 leading-relaxed">
                    We compared OCR texts, categories, and vector weights but didn't cross the score thresholds.
                  </p>
                </div>
              ) : (
                <ul className="space-y-6">
                  {matches.matches.map((m, idx) => (
                    <li key={m.match_id} className="glass-card p-6 flex flex-col gap-5 border-border hover:border-primary/30 transition-all duration-300">
                      
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {/* Image Preview / Score */}
                        {m.found_item.image_path ? (
                          <div className="relative flex-shrink-0 group">
                            <img
                              src={getImageUrl(m.found_item.image_path)}
                              alt="Matching item"
                              className="w-28 h-28 object-cover rounded-2xl border border-border shadow-md group-hover:scale-[1.03] transition-transform duration-300"
                            />
                            <div className="absolute -top-3.5 -right-3.5">
                              <ScoreRing score={m.score * 100} />
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-28 h-28 rounded-2xl bg-surface-container flex items-center justify-center border border-border text-on-surface-variant">
                              <Package size={32} />
                            </div>
                            <div className="absolute -top-3.5 -right-3.5">
                              <ScoreRing score={m.score * 100} />
                            </div>
                          </div>
                        )}

                        {/* Attribute Descriptions */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-sora font-extrabold text-on-surface text-base">{m.found_item.category}</h4>
                            {m.found_item.brand && (
                              <span className="badge badge-blue text-[10px]">{m.found_item.brand}</span>
                            )}
                            {idx === 0 && (
                              <span className="badge badge-purple text-[10px]">Best Match</span>
                            )}
                          </div>

                          {/* Reasoning Box */}
                          <div className="p-3.5 bg-primary-container border border-primary/20 rounded-2xl flex gap-2">
                            <Zap size={14} className="text-primary mt-0.5 flex-shrink-0 animate-pulse" />
                            <p className="text-xs text-primary-container leading-relaxed">
                              {m.reason}
                            </p>
                          </div>

                          {/* Attribute Badges */}
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className="badge badge-secondary flex items-center gap-1">
                              <MapPin size={9} /> {m.found_item.location}
                            </span>
                            {m.found_item.color && (
                              <span className="badge badge-purple">Color: {m.found_item.color}</span>
                            )}
                            {m.found_item.contact_phone && (
                              <span className="badge badge-green flex items-center gap-1">
                                <Phone size={9} /> Finder: {m.found_item.contact_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* OCR and Details */}
                      {m.found_item.ocr_text && (
                        <div className="flex flex-col gap-1.5">
                          <div className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                            <FileText size={11} /> Extracted Document Text (OCR)
                          </div>
                          <div className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 max-h-20 overflow-y-auto break-all">
                            {m.found_item.ocr_text}
                          </div>
                        </div>
                      )}

                      {/* Description summary */}
                      {m.found_item.ai_description && (
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant">Finder's Description</p>
                          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 bg-surface-container rounded-xl p-3">
                            {m.found_item.ai_description}
                          </p>
                        </div>
                      )}

                      {/* Claim item CTA */}
                      <div className="border-t border-border pt-4 flex justify-end">
                        <Link
                          to="/claims"
                          state={{ found_item_id: m.found_item_id, lost_item_id: selectedLostId }}
                          className="btn-success text-xs font-semibold py-2 px-4 inline-flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Claim Ownership
                        </Link>
                      </div>

                    </li>
                  ))}
                </ul>
              )}

            </div>
          )}

          {/* All system matches (when no lost selection is active) */}
          {!selectedLostId && allMatches.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-4 px-1">
                <CheckCircle size={16} className="text-emerald-400" />
                <h3 className="font-sora font-bold text-on-surface text-base">Global Match Log</h3>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allMatches.slice(0, 4).map(m => (
                  <li key={m.id} className="glass-card p-4 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <ScoreRing score={m.score * 100} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface">Match ID #{m.id}</p>
                        <p className="text-[11px] text-on-surface-variant leading-normal mt-1 line-clamp-2">{m.reason}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[9px] font-bold">
                      <span className="badge badge-purple">Lost #{m.lost_item_id}</span>
                      <span className="badge badge-green">Found #{m.found_item_id}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
