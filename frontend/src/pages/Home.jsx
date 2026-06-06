import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../api'
import { formatDistanceToNow } from 'date-fns'

const STAT_CARDS = [
  {
    key: 'total_lost',
    label: 'Total Lost Items',
    icon: 'search',
    color: 'text-error bg-error/10',
    trend: 'Needs Recovery',
  },
  {
    key: 'total_found',
    label: 'Total Found Items',
    icon: 'add_circle',
    color: 'text-tertiary bg-tertiary/10',
    trend: 'Awaiting Owner',
  },
  {
    key: 'successful_recoveries',
    label: 'AI Match Rate',
    icon: 'auto_awesome',
    color: 'text-primary bg-primary/10',
    trend: '84% Match Success',
    gradient: true,
  },
  {
    key: 'pending_claims',
    label: 'Items Recovered',
    icon: 'check_circle',
    color: 'text-secondary bg-secondary/10',
    trend: 'Recovered & Returned',
  },
]

function StatCard({ label, value, icon, color, trend, gradient }) {
  return (
    <article className="glass-card p-6 flex flex-col justify-between min-h-[140px] transition-all duration-300 relative overflow-hidden group">
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary/5 opacity-100 transition-opacity pointer-events-none" />
      )}
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 rounded-2xl ${color}`}>
          <span
            className="material-symbols-outlined text-2xl block"
            style={gradient ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {icon}
          </span>
        </div>
        
        {trend && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80 bg-surface-container px-2.5 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <h3 className={`text-3xl font-extrabold tracking-tight ${gradient ? 'ai-gradient-text' : 'text-on-surface'}`}>
          {value ?? '—'}
        </h3>
        <p className="text-sm font-medium text-on-surface-variant mt-1">
          {label}
        </p>
      </div>
    </article>
  )
}

function ScoreBadge({ score }) {
  const pct = Math.round(score)
  const color = pct >= 80 ? 'text-tertiary border-tertiary/30 bg-tertiary/10' : pct >= 60 ? 'text-primary border-primary/30 bg-primary/10' : 'text-secondary border-secondary/30 bg-secondary/10'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      <span className="material-symbols-outlined text-[12px] block" style={{ fontVariationSettings: "'FILL' 1" }}>
        auto_awesome
      </span>
      {pct}% match
    </span>
  )
}

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    dashboardAPI.stats()
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      {/* ── HERO SECTION (Responsive Split Panel) ──────────────────────── */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 px-4 md:px-8 max-w-7xl mx-auto" aria-label="Hero Introduction">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-tertiary/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Bhagavad Gita Quote Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-secondary/10 border border-secondary/20 mb-6 max-w-xl animate-float">
              <span
                className="material-symbols-outlined text-secondary text-base block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                menu_book
              </span>
              <span className="text-[10px] font-semibold text-secondary leading-normal">
                "A gift is pure when given from the heart to the right person at the right time and place, expecting nothing in return." — Bhagavad Gita 17.20
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-sora font-extrabold mb-6 leading-[1.15] tracking-tight">
              <span className="text-on-surface">Lost Something?</span>
              <br />
              <span className="ai-gradient-text">Gemini AI Will Find It.</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed">
              LostLink AI is the smart lost-and-found recovery pipeline built for campuses. We use <strong className="text-primary font-semibold">Gemini Vision</strong>, intelligent text OCR, and high-dimensional semantic matching to instantly pair lost belongings with finders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link to="/report-lost" id="cta-report-lost" className="btn-primary w-full sm:w-auto justify-center">
                <span className="material-symbols-outlined text-lg block">search</span>
                I Lost Something
              </Link>
              <Link to="/report-found" id="cta-report-found" className="btn-secondary w-full sm:w-auto justify-center">
                <span className="material-symbols-outlined text-lg block" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                I Found Something
              </Link>
              <Link to="/search" id="cta-search" className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-surface hover:bg-surface-container transition-all text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-lg block">manage_search</span>
                Smart Search
              </Link>
            </div>
          </div>

          {/* Right Visual Interactive Graphic Column */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative p-6 rounded-3xl border border-border bg-surface-container-low/40 shadow-2xl backdrop-blur-md overflow-hidden aspect-[4/3] flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              
              {/* Animated Floating Radar Grid */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Live Match Radar</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-base block animate-spin-slow">
                  progress_activity
                </span>
              </div>

              {/* Graphical Matching Concept */}
              <div className="flex items-center justify-center gap-8 py-6 relative">
                {/* Left Mini-Card: Lost */}
                <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center flex flex-col items-center gap-2 animate-float">
                  <img src="/uploads/keys.jpg" alt="Keys" className="w-12 h-12 object-cover rounded-xl border border-rose-500/20 shadow-md flex-shrink-0" />
                  <p className="text-[10px] font-bold text-rose-400">LOST REPORT</p>
                  <p className="text-xs text-on-surface font-semibold max-w-[80px] truncate">Keys, Charger...</p>
                </div>

                {/* Center Node (AI Matcher) */}
                <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 shadow-glow-primary flex items-center justify-center relative">
                  <span className="material-symbols-outlined text-2xl text-primary block animate-pulse">
                    auto_awesome
                  </span>
                  <div className="absolute -inset-2 border border-dashed border-primary/20 rounded-full animate-spin-slow" />
                </div>

                {/* Right Mini-Card: Found */}
                <div className="p-4 rounded-2xl border border-tertiary/20 bg-tertiary/5 text-center flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '2s' }}>
                  <img src="/uploads/id_card.jpg" alt="ID Card" className="w-12 h-12 object-cover rounded-xl border border-tertiary/20 shadow-md flex-shrink-0" />
                  <p className="text-[10px] font-bold text-tertiary">FOUND ITEM</p>
                  <p className="text-xs text-on-surface font-semibold max-w-[80px] truncate">AI Analyzed</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 text-center">
                <p className="text-xs text-on-surface-variant font-medium">
                  Matches are evaluated by category semantics & OCR texts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT GRID ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        
        {/* Statistics Bento Grid */}
        <section aria-label="Campus Statistics" className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-tertiary text-2xl block">dashboard_customize</span>
            <h2 className="text-xl font-bold font-sora text-on-surface">Campus Activity Overview</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-[140px] rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center border-error/20 bg-error/5">
              <span className="material-symbols-outlined text-error text-4xl mb-3 block">wifi_off</span>
              <p className="text-on-surface-variant text-sm">
                FastAPI Server is offline — start backend services to see campus statistics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map(card => (
                <StatCard
                  key={card.key}
                  {...card}
                  value={data?.stats?.[card.key]}
                />
              ))}
            </div>
          )}
        </section>

        {/* How It Works pipeline */}
        <section aria-label="AI Pipeline Breakdown" className="mb-12">
          <div className="section-label mb-6">AI-Powered Recover Pipeline</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01', icon: 'cloud_upload', title: 'Upload & Describe',
                color: 'text-primary bg-primary/10',
                desc: 'Upload an image of a found item. Gemini Vision instantly detects the category, color, brand, and OCR text.'
              },
              {
                step: '02', icon: 'auto_awesome', title: 'AI Match Analysis',
                color: 'text-tertiary bg-tertiary/10',
                desc: 'High-dimensional embeddings compare descriptions, locations, and extracted text to find matching owners.'
              },
              {
                step: '03', icon: 'contact_support', title: 'Connect & Recover',
                color: 'text-secondary bg-secondary/10',
                desc: 'Owner submits claim proof. Finder validates and shares contact phone numbers for secure handover.'
              }
            ].map(({ step, icon, title, desc, color }) => (
              <article key={step} className="glass-card p-6 flex flex-col gap-4 hover:scale-[1.01] transition-transform duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-6xl font-black text-on-surface-variant/10 leading-none">{step}</span>
                  <div className={`p-3 rounded-2xl ${color}`}>
                    <span className="material-symbols-outlined text-xl block" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {icon}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-sora font-bold text-on-surface text-base mb-2">{title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Two-Column Grid: Left: Recent Matches, Right: Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent AI Matches */}
          <section className="lg:col-span-8 glass-card p-6" aria-label="Recent Match Matches">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sora font-bold text-on-surface text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl block">center_focus_strong</span>
                Recent AI Matches
              </h3>
              <Link to="/matches" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-tertiary transition-colors flex items-center gap-1">
                Match Center
                <span className="material-symbols-outlined text-sm block">arrow_forward_ios</span>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
              </div>
            ) : data?.recent_matches?.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recent_matches.slice(0, 4).map(match => {
                  const lostImg = match.lost_item?.image_path ? match.lost_item.image_path.replace('./', '/') : null
                  const foundImg = match.found_item?.image_path ? match.found_item.image_path.replace('./', '/') : null
                  return (
                    <li key={match.id} className="rounded-2xl bg-surface-container-low border border-border hover:border-primary/30 transition-all duration-200 flex flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Dual Thumbnails */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {lostImg ? (
                                <img src={lostImg} alt="Lost item" className="w-9 h-9 object-cover rounded-lg border border-border" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-surface-container border border-border flex items-center justify-center text-on-surface-variant text-[11px]">
                                  <span className="material-symbols-outlined text-sm">help</span>
                                </div>
                              )}
                              
                              <span className="material-symbols-outlined text-xs text-on-surface-variant">arrow_forward</span>

                              {foundImg ? (
                                <img src={foundImg} alt="Found item" className="w-9 h-9 object-cover rounded-lg border border-border" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-surface-container border border-border flex items-center justify-center text-on-surface-variant text-[11px]">
                                  <span className="material-symbols-outlined text-sm">inventory_2</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="min-w-0">
                              <span className="font-bold text-on-surface text-xs block truncate leading-tight">
                                {match.lost_item?.title || 'Lost Item'}
                              </span>
                              <span className="text-[10px] text-on-surface-variant font-medium block truncate leading-none mt-1">
                                Category: {match.found_item?.category || 'Found Item'}
                              </span>
                            </div>
                          </div>
                          <ScoreBadge score={match.score} />
                        </div>
                        
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                          {match.reason}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant/80 font-bold uppercase">
                          Match ID #{match.id}
                        </span>
                        <Link to="/matches" className="text-xs font-bold text-primary hover:underline">
                          Review Match
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-3 block">hub</span>
                <p className="text-on-surface-variant text-sm mb-3">No AI matches detected yet</p>
                <Link to="/report-lost" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                  Report lost item to evaluate matching
                </Link>
              </div>
            )}
          </section>

          {/* Sidebar Insights & Activity */}
          <aside className="lg:col-span-4 flex flex-col gap-6" aria-label="Campus Insights Sidebar">
            {/* AI Insights Card */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <h3 className="font-sora font-bold text-on-surface text-base mb-4 flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined text-primary text-xl block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  psychology
                </span>
                AI Hotspots
              </h3>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-surface-container/60 p-4 rounded-xl border border-border">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Most Lost Item Type</p>
                  <p className="text-sm text-on-surface font-semibold">
                    Earphones & USB Chargers
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs block">pin_drop</span>
                    Hotspot: Central Library
                  </p>
                </div>
                
                <div className="bg-surface-container/60 p-4 rounded-xl border border-border">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-label-caps">WEEKLY RECOVERY RATE</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-primary leading-none">
                      {data?.stats ? Math.round((data.stats.successful_recoveries / Math.max(data.stats.total_lost, 1)) * 100) : 75}%
                    </span>
                    <span className="text-[10px] text-on-surface-variant/80 font-bold uppercase pb-0.5">Success Rate</span>
                  </div>
                  <div className="score-bar mt-3">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${data?.stats ? Math.round((data.stats.successful_recoveries / Math.max(data.stats.total_lost, 1)) * 100) : 75}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="glass-card p-6 flex-1 flex flex-col justify-between" aria-label="Activity Feed">
              <div>
                <h3 className="font-sora font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl block">history</span>
                  Campus Activity Feed
                </h3>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                  </div>
                ) : data?.activity_feed?.length > 0 ? (
                  <ul className="space-y-4">
                    {data.activity_feed.slice(0, 5).map((item, idx) => {
                      const imgUrl = item.image_path ? item.image_path.replace('./', '/') : null
                      return (
                        <li key={idx} className="flex items-center gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt="Activity Item" className="w-10 h-10 object-cover rounded-xl border border-border flex-shrink-0" />
                          ) : (
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl border border-border flex items-center justify-center bg-surface-container text-on-surface-variant ${
                              item.type === 'found' ? 'text-tertiary' : 'text-on-surface-variant'
                            }`}>
                              <span className="material-symbols-outlined text-lg block">
                                {item.type === 'found' ? 'inventory_2' : 'help'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-on-surface leading-normal line-clamp-2">{item.text}</p>
                            <span className="text-[10px] font-bold text-on-surface-variant/70 mt-1 block">
                              {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/50 mb-2 block">history</span>
                    <p className="text-on-surface-variant text-xs">No recent activity logged</p>
                  </div>
                )}
              </div>

              {/* Quick Action CTAs */}
              <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-3">
                <Link to="/report-found" id="quick-report-found" className="btn-secondary py-2 justify-center text-xs">
                  <span className="material-symbols-outlined text-sm block" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                  Found Item
                </Link>
                <Link to="/report-lost" id="quick-report-lost" className="btn-secondary py-2 justify-center text-xs">
                  <span className="material-symbols-outlined text-sm block">search</span>
                  Lost Item
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
