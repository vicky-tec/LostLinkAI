import { useState } from 'react'
import { searchAPI } from '../api'
import toast from 'react-hot-toast'
import {
  Search as SearchIcon, Zap, Loader2, Package, MapPin, FileText,
  AlertCircle, Tag, Sparkles, ArrowRight, CornerDownLeft, FileQuestion
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

const EXAMPLE_QUERIES = [
  'Show black wallets found near hostel',
  'ID cards found this week',
  'Lost earbuds JBL library',
  'Keys with red keychain',
  'Samsung phone with green case',
]

function ScorePill({ score }) {
  const pct = Math.round(score)
  const color = pct >= 70 ? 'text-tertiary border-tertiary/20 bg-tertiary/10' : pct >= 50 ? 'text-primary border-primary/20 bg-primary/10' : 'text-secondary border-secondary/20 bg-secondary/10'
  return (
    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${color}`}>
      {pct}% match
    </span>
  )
}

function FoundCard({ item, score }) {
  const imgUrl = item.image_path ? item.image_path.replace('./', '/') : null
  return (
    <article className="glass-card p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
      <div className="flex gap-4">
        {imgUrl ? (
          <img src={imgUrl} alt={item.category} className="w-20 h-20 object-cover rounded-xl border border-border flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-surface-container border border-border flex items-center justify-center text-on-surface-variant flex-shrink-0">
            <Package size={24} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="font-bold text-on-surface text-sm">{item.category || 'Unknown'}</span>
            {item.brand && <span className="badge badge-blue text-[9px] font-bold">{item.brand}</span>}
            <ScorePill score={score} />
            <span className={`badge text-[9px] font-bold ${item.status === 'unclaimed' ? 'badge-yellow' : 'badge-green'}`}>
              {item.status}
            </span>
          </div>
          
          {item.ai_description && (
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3 line-clamp-3">
              {item.ai_description}
            </p>
          )}
          
          {item.ocr_text && (
            <div className="flex flex-col gap-1.5 mb-3 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                <FileText size={10} /> Extracted Document Text
              </span>
              <p className="font-mono text-[10px] text-emerald-400 truncate break-all">{item.ocr_text}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold mb-4">
          {item.color && <span className="badge badge-purple">Color: {item.color}</span>}
          {item.location && (
            <span className="badge badge-blue">
              <MapPin size={9} /> {item.location}
            </span>
          )}
          <span className="text-[10px] text-on-surface-variant font-medium self-center ml-auto">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>

        <div className="flex gap-3 border-t border-border pt-4">
          <Link to="/claims" state={{ found_item_id: item.id }} className="btn-success text-xs py-2 px-4 flex-1 justify-center">
            Claim This
          </Link>
          <Link to="/matches" className="btn-secondary text-xs py-2 px-4 flex-1 justify-center">
            Find Owner
          </Link>
        </div>
      </div>
    </article>
  )
}

function LostCard({ item, score }) {
  const imgUrl = item.image_path ? item.image_path.replace('./', '/') : null
  return (
    <article className="glass-card p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
      <div className="flex gap-4">
        {imgUrl ? (
          <img src={imgUrl} alt={item.title} className="w-20 h-20 object-cover rounded-xl border border-border flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-surface-container border border-border flex items-center justify-center text-on-surface-variant flex-shrink-0">
            <Package size={24} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="font-bold text-on-surface text-sm">{item.title}</span>
            <ScorePill score={score} />
            <span className={`badge text-[9px] font-bold ${item.status === 'active' ? 'badge-red' : 'badge-green'}`}>
              {item.status}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-3">{item.description}</p>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold mb-4">
          {item.location && (
            <span className="badge badge-purple">
              <MapPin size={9} /> {item.location}
            </span>
          )}
          {item.date_lost && <span className="badge badge-yellow">Lost: {item.date_lost}</span>}
        </div>

        <div className="border-t border-border pt-4">
          <Link to={`/matches`} className="btn-primary text-xs py-2 w-full justify-center">
            <Zap size={12} /> Run AI Match
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function SmartSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const runSearch = async (q) => {
    const searchQ = q || query
    if (!searchQ.trim()) { toast.error('Enter a description to search'); return }
    setLoading(true)
    setResults(null)
    try {
      const res = await searchAPI.query(searchQ)
      setResults(res.data)
      if (res.data.total === 0) toast('No high similarity results found', { icon: '🔍' })
    } catch {
      toast.error('Search failed. Verify FastAPI server status.')
    } finally {
      setLoading(false)
    }
  }

  const handleExample = (q) => {
    setQuery(q)
    runSearch(q)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20">
      
      {/* Page Header */}
      <header className="page-header relative overflow-hidden rounded-2xl bg-surface-container-low/30 border border-border p-6 mb-8">
        <div className="absolute right-4 top-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="section-label mb-2">Natural Language Semantics</div>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-2 font-sora">
          Smart Search
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Type queries in natural conversational English. The semantic vector engine indexes meaning, matching items even without exact keyword matches.
        </p>
      </header>

      {/* Floating Search Bar */}
      <div className="mb-8">
        <form
          onSubmit={e => { e.preventDefault(); runSearch() }}
          className="flex flex-col sm:flex-row gap-3"
          role="search"
        >
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              id="smart-search-input"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Describe what you are looking for (e.g. blue student ID with name rahul)..."
              className="input-field !pl-12 pr-4 py-4 text-sm"
              aria-label="Search lost and found items"
            />
          </div>
          <button
            type="submit"
            id="search-submit-btn"
            disabled={loading}
            className="btn-primary px-8 py-3.5 text-sm font-semibold disabled:opacity-50 justify-center shrink-0"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles size={16} />
                AI Search
              </span>
            )}
          </button>
        </form>

        {/* Suggestion capsules */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mr-1">Examples:</span>
          {EXAMPLE_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => handleExample(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-surface-container border border-border text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all flex items-center gap-1 font-medium"
            >
              <ArrowRight size={10} />
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="glass-card p-12 text-center flex flex-col items-center gap-3">
          <div className="relative w-14 h-14">
            <Loader2 size={56} className="text-primary animate-spin" />
            <Zap size={18} className="text-emerald-400 absolute inset-0 m-auto" />
          </div>
          <h3 className="font-sora font-semibold text-on-surface text-base">Running Vector Searches</h3>
          <p className="text-xs text-on-surface-variant">Scanning campus databases for semantic coordinates...</p>
        </div>
      )}

      {/* Results Workspace */}
      {results && !loading && (
        <div className="flex flex-col gap-8">
          
          {/* Query Summary Badge Banner */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-container border border-primary/20">
            <Sparkles size={16} className="text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-primary-container uppercase tracking-wider">Semantic Query Result</p>
              <p className="text-on-surface font-semibold text-sm">"{results.query}"</p>
            </div>
            <span className="ml-auto badge badge-purple">
              {results.total} matching entries
            </span>
          </div>

          {/* Found Items grid */}
          {results.found_items.length > 0 && (
            <section aria-label="Found items search results">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-emerald-400" />
                <h3 className="font-sora font-bold text-on-surface text-base">Matched Found Listings</h3>
                <span className="badge badge-green text-[9px] font-bold">{results.found_items.length} matches</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.found_items.map(r => (
                  <FoundCard key={r.item.id} item={r.item} score={r.score} />
                ))}
              </div>
            </section>
          )}

          {/* Lost Items grid */}
          {results.lost_items.length > 0 && (
            <section aria-label="Lost items search results">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={16} className="text-rose-400" />
                <h3 className="font-sora font-bold text-on-surface text-base">Matched Lost Reports</h3>
                <span className="badge badge-red text-[9px] font-bold">{results.lost_items.length} reports</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.lost_items.map(r => (
                  <LostCard key={r.item.id} item={r.item} score={r.score} />
                ))}
              </div>
            </section>
          )}

          {/* Zero results */}
          {results.total === 0 && (
            <div className="glass-card p-12 text-center border-dashed">
              <FileQuestion size={40} className="text-on-surface-variant/40 mx-auto mb-3" />
              <h3 className="font-sora font-bold text-on-surface text-base mb-1">Zero Matches Located</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto mb-6">
                No active items match your query semantic details. Try general keywords or register a custom card.
              </p>
              <div className="flex gap-3 justify-center text-xs">
                <Link to="/report-found" className="btn-primary text-xs py-2 px-4">Report Found Item</Link>
                <Link to="/report-lost" className="btn-secondary text-xs py-2 px-4">Report Lost Item</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial Entry State */}
      {!results && !loading && (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-sm animate-pulse-slow">
            <SearchIcon size={24} className="text-primary animate-float" />
          </div>
          <h3 className="font-sora font-bold text-on-surface text-base mb-2">Semantic AI Search</h3>
          <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
            Unlike keyword matching, LostLink maps concepts. Typing "wireless headphones" will automatically recommend "earbuds" or "JBL charger tags" based on concept dimensions.
          </p>
        </div>
      )}
    </div>
  )
}
