import { useEffect, useState } from 'react'
import { adminAPI, foundAPI, lostAPI } from '../api'
import toast from 'react-hot-toast'
import {
  Shield, Users, Package, AlertCircle, GitCompare,
  Trash2, CheckCircle, RefreshCw, Loader2, TrendingUp,
  Eye, BarChart3, Clock, Trash, MapPin
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function StatBox({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: 'text-primary bg-primary/10 border-primary/20',
    emerald: 'text-tertiary bg-tertiary/10 border-tertiary/20',
    rose: 'text-error bg-error/10 border-error/20',
    amber: 'text-secondary bg-secondary/10 border-secondary/20',
    blue: 'text-primary bg-primary/10 border-primary/20',
    purple: 'text-secondary bg-secondary/10 border-secondary/20',
  }
  const c = colors[color] || colors.indigo
  return (
    <div className="glass-card p-5 flex items-center gap-4 border">
      <div className={`p-3 rounded-2xl ${c.split(' ')[1]} ${c.split(' ')[2]}`}>
        <Icon size={20} className={c.split(' ')[0]} />
      </div>
      <div>
        <h4 className="text-2xl font-extrabold text-on-surface tracking-tight">{value ?? '—'}</h4>
        <p className="text-xs text-on-surface-variant font-semibold mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [lostItems, setLostItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [sRes, uRes, fRes, lRes] = await Promise.all([
        adminAPI.stats(), adminAPI.users(), foundAPI.list(), lostAPI.list()
      ])
      setStats(sRes.data)
      setUsers(uRes.data)
      setFoundItems(fRes.data)
      setLostItems(lRes.data)
    } catch {
      toast.error('Failed to load logs. Verify server is active.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const TABS = [
    { id: 'overview', label: 'Overview',     icon: BarChart3 },
    { id: 'found',    label: 'Found Items',  icon: Package },
    { id: 'lost',     label: 'Lost Items',   icon: AlertCircle },
    { id: 'users',    label: 'Users',        icon: Users },
  ]

  const handleDeleteItem = async (id, type) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      if (type === 'found') {
        await adminAPI.deleteFound(id)
        setFoundItems(prev => prev.filter(i => i.id !== id))
      } else {
        await adminAPI.deleteLost(id)
        setLostItems(prev => prev.filter(i => i.id !== id))
      }
      toast.success('Record successfully deleted')
      loadAll()
    } catch {
      toast.error('Deletion failed')
    }
  }

  const handleStatusChange = async (id, status, type) => {
    try {
      if (type === 'found') {
        await adminAPI.updateFoundStatus(id, status)
        setFoundItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
      } else {
        await adminAPI.updateLostStatus(id, status)
        setLostItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
      }
      toast.success('Status updated')
      loadAll()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20">
      
      {/* Header */}
      <header className="page-header relative overflow-hidden rounded-2xl bg-surface-container-low/30 border border-border p-6 mb-8">
        <div className="absolute right-4 top-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="section-label mb-2">System Administration</div>
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-1 flex items-center gap-3 font-sora">
              <Shield size={28} className="text-primary animate-pulse" />
              Admin Control Console
            </h1>
            <p className="text-sm text-on-surface-variant max-w-xl">
              Monitor active logs, review recovery analytics, manage listings, and audit campus databases.
            </p>
          </div>
          <button
            onClick={loadAll}
            className="btn-secondary w-full sm:w-auto justify-center"
            id="admin-refresh-btn"
          >
            <RefreshCw size={14} className={`mr-2 block ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>
      </header>

      {/* Tabs list selector */}
      <nav className="flex gap-1.5 p-1 rounded-2xl bg-surface-container border border-border mb-8 w-full sm:w-fit overflow-x-auto" aria-label="Admin tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`admin-tab-${id}`}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
              tab === id
                ? 'bg-primary text-white shadow-glow-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>

      {/* TABS WORKSPACES */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-[100px] rounded-2xl" />)}
          </div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      ) : (
        <div>
          
          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && stats && (
            <div className="flex flex-col gap-8">
              
              {/* Stats Box grids */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatBox label="Total Users Registered" value={stats.users}      icon={Users}       color="indigo" />
                <StatBox label="Lost Items Reports"     value={stats.lost_items} icon={AlertCircle} color="rose"   />
                <StatBox label="Found Items Catalog"    value={stats.found_items} icon={Package}     color="emerald" />
                <StatBox label="AI Embeddings Match"    value={stats.matches}    icon={GitCompare}  color="purple" />
                <StatBox label="Ownership Claims"       value={stats.claims}     icon={TrendingUp}  color="amber"  />
                <StatBox label="Returned Recoveries"    value={stats.recoveries} icon={CheckCircle} color="blue"   />
              </div>

              {/* Recovery rate progress card */}
              {stats.lost_items > 0 && (
                <div className="glass-card p-6 border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sora font-bold text-on-surface">Campus Recovery Ratio</h3>
                    <span className="text-2xl font-extrabold text-tertiary">
                      {Math.round((stats.recoveries / stats.lost_items) * 100)}%
                    </span>
                  </div>
                  
                  <div className="h-4 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((stats.recoveries / stats.lost_items) * 100, 100)}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-on-surface-variant font-medium">
                    {stats.recoveries} items successfully returned to owners out of {stats.lost_items} reports.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: FOUND ITEMS TABLE / MOBILE CARDS */}
          {tab === 'found' && (
            <section aria-label="Found items database">
              <div className="glass-card border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h3 className="font-sora font-bold text-on-surface text-base">Found Registries ({foundItems.length})</h3>
                </div>                {/* Mobile Cards lists */}
                <div className="block md:hidden divide-y divide-border">
                  {foundItems.length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant">No found logs recorded.</div>
                  ) : foundItems.map(item => {
                    const imgUrl = item.image_path ? item.image_path.replace('./', '/') : null
                    return (
                      <div key={item.id} className="p-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.category} className="w-12 h-12 object-cover rounded-xl border border-border flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-surface-container border border-border flex items-center justify-center text-on-surface-variant flex-shrink-0">
                              <Package size={18} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[10px] font-mono text-on-surface-variant font-bold">#{item.id}</span>
                                <h4 className="font-bold text-sm text-on-surface mt-0.5 truncate">{item.category || 'Unknown'}</h4>
                              </div>
                              <span className="text-[10px] text-on-surface-variant shrink-0">
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                          {item.ai_description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          <span className="badge badge-secondary flex items-center gap-0.5">
                            <MapPin size={9} /> {item.location}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                          <select
                            value={item.status}
                            onChange={e => handleStatusChange(item.id, e.target.value, 'found')}
                            className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1 text-on-surface outline-none"
                          >
                            {['unclaimed', 'claimed', 'closed'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleDeleteItem(item.id, 'found')}
                            className="p-1.5 rounded-lg border border-border hover:bg-error/10 hover:border-error text-on-surface-variant hover:text-error transition-colors"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop table list */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left" role="grid">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container/30 border-b border-border">
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Image</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4">Description Snippet</th>
                        <th className="px-5 py-4">Location</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Reported</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {foundItems.length === 0 ? (
                        <tr><td colSpan={8} className="px-5 py-8 text-center text-on-surface-variant">No items indexed.</td></tr>
                      ) : foundItems.map(item => {
                        const imgUrl = item.image_path ? item.image_path.replace('./', '/') : null
                        return (
                          <tr key={item.id} className="hover:bg-surface-container/20 transition-colors">
                            <td className="px-5 py-4 font-mono text-on-surface-variant">#{item.id}</td>
                            <td className="px-5 py-4">
                              {imgUrl ? (
                                <img src={imgUrl} alt={item.category} className="w-10 h-10 object-cover rounded-lg border border-border" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-surface-container border border-border flex items-center justify-center text-on-surface-variant">
                                  <Package size={16} />
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 font-bold text-on-surface">{item.category}</td>
                            <td className="px-5 py-4 text-on-surface-variant max-w-xs truncate" title={item.ai_description}>
                              {item.ai_description}
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant">{item.location}</td>
                            <td className="px-5 py-4">
                              <select
                                value={item.status}
                                onChange={e => handleStatusChange(item.id, e.target.value, 'found')}
                                className="bg-transparent border border-border rounded-lg px-2 py-1 text-on-surface outline-none"
                              >
                                {['unclaimed', 'claimed', 'closed'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => handleDeleteItem(item.id, 'found')}
                                className="p-2 rounded-xl hover:bg-error/15 text-on-surface-variant hover:text-error transition-colors"
                              >
                                <Trash size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            </section>
          )}

          {/* TAB 3: LOST ITEMS TABLE / MOBILE CARDS */}
          {tab === 'lost' && (
            <section aria-label="Lost items database">
              <div className="glass-card border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h3 className="font-sora font-bold text-on-surface text-base">Lost reports ({lostItems.length})</h3>
                </div>

                {/* Mobile Cards list */}
                <div className="block md:hidden divide-y divide-border">
                  {lostItems.length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant">No lost records log.</div>
                  ) : lostItems.map(item => {
                    const imgUrl = item.image_path ? item.image_path.replace('./', '/') : null
                    return (
                      <div key={item.id} className="p-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.title} className="w-12 h-12 object-cover rounded-xl border border-border shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-surface-container border border-border flex items-center justify-center text-on-surface-variant shrink-0">
                              <Package size={18} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[10px] font-mono text-on-surface-variant font-bold">#{item.id}</span>
                                <h4 className="font-bold text-sm text-on-surface mt-0.5 truncate">{item.title}</h4>
                              </div>
                              <span className="text-[10px] text-on-surface-variant shrink-0">
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          <span className="badge badge-secondary flex items-center gap-0.5">
                            <MapPin size={9} /> {item.location}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                          <select
                            value={item.status}
                            onChange={e => handleStatusChange(item.id, e.target.value, 'lost')}
                            className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1 text-on-surface outline-none"
                          >
                            {['active', 'recovered', 'closed'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleDeleteItem(item.id, 'lost')}
                            className="p-1.5 rounded-lg border border-border hover:bg-error/10 hover:border-error text-on-surface-variant hover:text-error transition-colors"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left" role="grid">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container/30 border-b border-border">
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Image</th>
                        <th className="px-5 py-4">Title</th>
                        <th className="px-5 py-4">Description Snippet</th>
                        <th className="px-5 py-4">Location</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Reported</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {lostItems.length === 0 ? (
                        <tr><td colSpan={8} className="px-5 py-8 text-center text-on-surface-variant">No reports found.</td></tr>
                      ) : lostItems.map(item => {
                        const imgUrl = item.image_path ? item.image_path.replace('./', '/') : null
                        return (
                          <tr key={item.id} className="hover:bg-surface-container/20 transition-colors">
                            <td className="px-5 py-4 font-mono text-on-surface-variant">#{item.id}</td>
                            <td className="px-5 py-4">
                              {imgUrl ? (
                                <img src={imgUrl} alt={item.title} className="w-10 h-10 object-cover rounded-lg border border-border" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-surface-container border border-border flex items-center justify-center text-on-surface-variant">
                                  <Package size={16} />
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 font-bold text-on-surface">{item.title}</td>
                            <td className="px-5 py-4 text-on-surface-variant max-w-xs truncate" title={item.description}>
                              {item.description}
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant">{item.location}</td>
                            <td className="px-5 py-4">
                              <select
                                value={item.status}
                                onChange={e => handleStatusChange(item.id, e.target.value, 'lost')}
                                className="bg-transparent border border-border rounded-lg px-2 py-1 text-on-surface outline-none"
                              >
                                {['active', 'recovered', 'closed'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => handleDeleteItem(item.id, 'lost')}
                                className="p-2 rounded-xl hover:bg-error/15 text-on-surface-variant hover:text-error transition-colors"
                              >
                                <Trash size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            </section>
          )}

          {/* TAB 4: USERS DATABASE */}
          {tab === 'users' && (
            <section aria-label="Users registry logs">
              <div className="glass-card border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h3 className="font-sora font-bold text-on-surface text-base">Users registries ({users.length})</h3>
                </div>

                {/* Mobile Cards list */}
                <div className="block md:hidden divide-y divide-border">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant">No users registered yet.</div>
                  ) : users.map(user => (
                    <div key={user.id} className="p-4 flex flex-col gap-2 text-xs">
                      <div className="flex justify-between items-center gap-4">
                        <span className="font-mono text-on-surface-variant font-bold">#{user.id}</span>
                        <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'} text-[9px]`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="font-bold text-on-surface">{user.name}</p>
                      <p className="text-on-surface-variant text-[11px] font-mono">{user.email}</p>
                      <span className="text-[10px] text-on-surface-variant mt-1">
                        Joined: {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Desktop table list */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left" role="grid">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container/30 border-b border-border">
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Email Address</th>
                        <th className="px-5 py-4">Role</th>
                        <th className="px-5 py-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {users.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">No users database records.</td></tr>
                      ) : users.map(u => (
                        <tr key={u.id} className="hover:bg-surface-container/20 transition-colors">
                          <td className="px-5 py-4 font-mono text-on-surface-variant">#{u.id}</td>
                          <td className="px-5 py-4 font-bold text-on-surface">{u.name}</td>
                          <td className="px-5 py-4 font-mono text-on-surface-variant">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'} text-[10px] font-bold`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-on-surface-variant text-right">
                            {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </section>
          )}

        </div>
      )}

    </div>
  )
}
