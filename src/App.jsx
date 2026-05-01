
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, LogOut } from 'lucide-react'
import { supabase } from './lib/supabase'

const stores = ['Albert Heijn', 'Polish Shop', 'Jumbo', 'Lidl', 'Kruidvat', 'Action']

const USERS = { dudu: 'bubu', bubu: 'dudu' }

// ── Simple login screen ───────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const submit = () => {
    const u = username.trim().toLowerCase()
    if (USERS[u] && USERS[u] === password.trim().toLowerCase()) {
      onLogin(u)
    } else {
      setError('Wrong username or password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-10 max-w-sm w-full text-center"
      >
        <h1 className="text-3xl font-bold mb-1">Shopping List</h1>
        <p className="text-zinc-500 mb-8 text-sm">Who are you?</p>

        <div className="flex flex-col gap-3 text-left">
          <input
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Username"
            className="glass rounded-2xl p-4 outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Password"
            className="glass rounded-2xl p-4 outline-none"
          />
          {error && <p className="text-red-400 text-sm px-1">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={submit}
            className="rounded-2xl py-4 bg-white text-black font-semibold text-base mt-1"
          >
            Enter
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('sl-user') || '')
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [item, setItem]           = useState('')
  const [qty, setQty]             = useState(1)
  const [store, setStore]         = useState(stores[0])
  const [activeStore, setActiveStore] = useState(stores[0])
  const channelRef = useRef(null)

  const login = (name) => {
    localStorage.setItem('sl-user', name)
    setUserName(name)
  }
  const logout = () => {
    localStorage.removeItem('sl-user')
    setUserName('')
    setItems([])
    setLoading(true)
  }

  // Fetch + realtime subscription
  useEffect(() => {
    if (!userName) return

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: true })
      if (!error && data) setItems(data)
      setLoading(false)
    }
    fetchItems()

    channelRef.current = supabase
      .channel('shopping_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_items' },
        ({ eventType, new: row, old: oldRow }) => {
          if (eventType === 'INSERT') {
            setItems(prev => {
              if (prev.some(i => i.id === row.id)) return prev
              return [...prev, row]
            })
          } else if (eventType === 'UPDATE') {
            setItems(prev => prev.map(i => i.id === row.id ? row : i))
          } else if (eventType === 'DELETE') {
            setItems(prev => prev.filter(i => i.id !== oldRow.id))
          }
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [userName])

  if (!userName) return <LoginScreen onLogin={login} />

  const addItem = async () => {
    if (!item.trim()) return
    const payload = { name: item.trim(), quantity: qty, store, completed: false, added_by: userName }
    setItem('')
    setQty(1)
    await supabase.from('shopping_items').insert(payload)
  }

  const toggleItem = async (id, current) => {
    await supabase
      .from('shopping_items')
      .update({ completed: !current, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  const deleteItem = async (id) => {
    await supabase.from('shopping_items').delete().eq('id', id)
  }

  const storeItems = items.filter(i => i.store === activeStore)
  const toBuy      = storeItems.filter(i => !i.completed)
  const bought     = storeItems.filter(i => i.completed)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">

        {/* Add item card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sticky top-4 z-10 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold">Shopping List</h1>
            </div>
            <button
              onClick={logout}
              title="Switch user"
              className="ml-2 opacity-40 hover:opacity-80 transition flex items-center gap-1 text-xs text-zinc-400"
            >
              <LogOut size={14} />
              {userName}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <input
              value={item}
              onChange={e => setItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add"
              className="glass rounded-2xl p-4 outline-none text-lg"
            />
            <div className="flex gap-3">
              <input
                type="number"
                value={qty}
                min="1"
                onChange={e => setQty(Number(e.target.value))}
                className="glass rounded-2xl p-4 w-24 outline-none"
              />
              <select
                value={store}
                onChange={e => setStore(e.target.value)}
                className="glass rounded-2xl p-4 flex-1 outline-none bg-transparent"
              >
                {stores.map(s => <option key={s} className="text-black">{s}</option>)}
              </select>
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.04 }}
                onClick={addItem}
                className="rounded-2xl px-6 bg-white text-black font-semibold flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Store tabs — wrapped grid */}
        <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3">
          {stores.map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveStore(s)}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                activeStore === s ? 'bg-white text-black' : 'glass'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="glass rounded-3xl p-10 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="space-y-3">

            {toBuy.length === 0 && bought.length === 0 && (
              <div className="glass rounded-3xl p-10 text-center text-zinc-400">
                Your {activeStore} run is looking empty.
              </div>
            )}

            {/* To Buy */}
            {toBuy.length > 0 && (
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">To Buy</p>
                <AnimatePresence initial={false}>
                  {toBuy.map((i, index) => (
                    <motion.div
                      key={i.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      transition={{ delay: index * 0.04 }}
                      className="glass rounded-3xl p-5 flex items-center justify-between mb-2"
                    >
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleItem(i.id, i.completed)}
                          className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-white/70 transition-colors"
                        />
                        <div>
                          <div className="text-lg font-medium">{i.name}</div>
                          <div className="text-sm text-zinc-400">Quantity: {i.quantity}</div>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => deleteItem(i.id)}
                        className="opacity-40 hover:opacity-100 transition"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Bought */}
            {bought.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">Bought</p>
                <AnimatePresence initial={false}>
                  {bought.map(i => (
                    <motion.div
                      key={i.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 0.45, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      className="glass rounded-3xl p-5 flex items-center justify-between mb-2"
                    >
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleItem(i.id, i.completed)}
                          className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center"
                        >
                          <Check size={14} className="text-black" strokeWidth={3} />
                        </motion.button>
                        <div className="line-through">
                          <div className="text-lg font-medium">{i.name}</div>
                          <div className="text-sm text-zinc-400">Quantity: {i.quantity}</div>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => deleteItem(i.id)}
                        className="opacity-40 hover:opacity-100 transition"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
