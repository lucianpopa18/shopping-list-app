
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, Pencil, MoveRight, X, Download, Upload, Settings } from 'lucide-react'

const BUILT_IN_STORES = ['Albert Heijn', 'Polish Shop', 'Jumbo', 'Lidl', 'Kruidvat', 'Action', 'Max Markt']
const LISTS_KEY = 'premium-shopping'
const STORES_KEY = 'premium-shopping-stores'
const HIDDEN_STORES_KEY = 'premium-shopping-hidden-stores'
const THEME_KEY = 'premium-shopping-theme'

export default function App() {
  const [lists, setLists] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LISTS_KEY)) || {} }
    catch { return {} }
  })

  const [customStores, setCustomStores] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORES_KEY)) || [] }
    catch { return [] }
  })

  const [hiddenStores, setHiddenStores] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HIDDEN_STORES_KEY)) || [] }
    catch { return [] }
  })

  const stores = [...BUILT_IN_STORES, ...customStores].filter(s => !hiddenStores.includes(s))

  const [item, setItem]               = useState('')
  const [qty, setQty]                 = useState(1)
  const [store, setStore]             = useState(BUILT_IN_STORES[0])
  const [activeStore, setActiveStore] = useState(BUILT_IN_STORES[0])

  const [editingId, setEditingId]   = useState(null)
  const [editName, setEditName]     = useState('')
  const [editQty, setEditQty]       = useState(1)

  const [showSettings, setShowSettings] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')

  const [movingId, setMovingId] = useState(null)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(THEME_KEY) || 'classic')

  const importRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
  }, [lists])

  useEffect(() => {
    localStorage.setItem(STORES_KEY, JSON.stringify(customStores))
  }, [customStores])

  useEffect(() => {
    localStorage.setItem(HIDDEN_STORES_KEY, JSON.stringify(hiddenStores))
  }, [hiddenStores])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode)
    document.documentElement.classList.toggle('feminine-root', themeMode === 'feminine')
    document.body.classList.toggle('feminine-body', themeMode === 'feminine')
    return () => {
      document.documentElement.classList.remove('feminine-root')
      document.body.classList.remove('feminine-body')
    }
  }, [themeMode])

  const addItem = () => {
    if (!item.trim()) return
    const newItem = { id: Date.now(), name: item.trim(), qty, completed: false }
    setLists(prev => ({ ...prev, [store]: [...(prev[store] || []), newItem] }))
    setItem('')
    setQty(1)
  }

  const toggleItem = id => {
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].map(i => i.id === id ? { ...i, completed: !i.completed } : i)
    }))
  }

  const deleteItem = id => {
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].filter(i => i.id !== id)
    }))
  }

  const startEdit = (i) => {
    setEditingId(i.id)
    setEditName(i.name)
    setEditQty(i.qty)
    setMovingId(null)
  }

  const saveEdit = () => {
    if (!editName.trim()) return
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].map(i =>
        i.id === editingId ? { ...i, name: editName.trim(), qty: editQty } : i
      )
    }))
    setEditingId(null)
  }

  const moveItem = (id, targetStore) => {
    const found = (lists[activeStore] || []).find(i => i.id === id)
    if (!found) return
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].filter(i => i.id !== id),
      [targetStore]: [...(prev[targetStore] || []), { ...found, id: Date.now() }]
    }))
    setMovingId(null)
  }

  const clearBought = () => {
    if (!window.confirm(`Clear all bought items from ${activeStore}?`)) return
    setLists(prev => ({
      ...prev,
      [activeStore]: (prev[activeStore] || []).filter(i => !i.completed)
    }))
  }

  const addStore = () => {
    const name = newStoreName.trim()
    if (!name) return
    if (hiddenStores.includes(name)) {
      setHiddenStores(prev => prev.filter(s => s !== name))
    } else if (!stores.includes(name) && !customStores.includes(name) && !BUILT_IN_STORES.includes(name)) {
      setCustomStores(prev => [...prev, name])
    } else {
      return
    }
    setNewStoreName('')
    setActiveStore(name)
    setStore(name)
  }

  const deleteStore = (name) => {
    if (stores.length <= 1) {
      alert('Keep at least one store in the app.')
      return
    }

    const hasItems = (lists[name] || []).length > 0
    const message = hasItems
      ? `Delete ${name} and its ${lists[name].length} saved item(s)? This only affects this v2 copy.`
      : `Delete ${name} from stores?`

    if (!window.confirm(message)) return

    if (BUILT_IN_STORES.includes(name)) {
      setHiddenStores(prev => prev.includes(name) ? prev : [...prev, name])
    } else {
      setCustomStores(prev => prev.filter(s => s !== name))
    }

    setLists(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })

    const remainingStores = stores.filter(s => s !== name)
    const fallback = remainingStores[0] || BUILT_IN_STORES[0]
    if (activeStore === name) setActiveStore(fallback)
    if (store === name) setStore(fallback)
  }

  const exportData = () => {
    const data = { lists, customStores, hiddenStores, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shopping-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (typeof data.lists !== 'object' || data.lists === null) {
          alert('Invalid backup: missing lists.')
          return
        }
        if (window.confirm('Replace current data with imported backup?')) {
          setLists(data.lists)
          if (Array.isArray(data.customStores)) setCustomStores(data.customStores)
          if (Array.isArray(data.hiddenStores)) setHiddenStores(data.hiddenStores)
        }
      } catch {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const allItems = lists[activeStore] || []
  const toBuy    = allItems.filter(i => !i.completed)
  const bought   = allItems.filter(i => i.completed)

  return (
    <div className={`min-h-screen p-4 app-shell ${themeMode === 'feminine' ? 'feminine-mode' : 'classic-mode'}`}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sticky top-4 z-10 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">Shopping List</h1>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(true)}
                className="glass rounded-xl p-2 opacity-70 hover:opacity-100 transition"
                title="Settings"
              >
                <Settings size={20} />
              </motion.button>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={importData} />
            </div>
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

        {/* Store selector */}
        <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3">
          {stores.map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveStore(s)
                setStore(s)
              }}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                activeStore === s ? 'bg-white text-black' : 'glass'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Settings modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-start justify-center"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                className="glass rounded-3xl p-5 w-full max-w-lg mt-8 max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <p className="text-sm text-zinc-400">Backup files and manage stores.</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(false)} className="glass rounded-xl p-2 opacity-70 hover:opacity-100">
                    <X size={18} />
                  </motion.button>
                </div>

                <div className="space-y-5">
                  <section>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Who are you?</p>
                    <div className="glass rounded-2xl p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setThemeMode('feminine')}
                          className={`mode-choice bubu ${themeMode === 'feminine' ? 'active' : ''}`}
                        >
                          Bubu
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setThemeMode('classic')}
                          className={`mode-choice dudu ${themeMode === 'classic' ? 'active' : ''}`}
                        >
                          Dudu
                        </motion.button>
                      </div>
                    </div>
                  </section>

                  <section>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Files</p>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button whileTap={{ scale: 0.96 }} onClick={exportData} className="glass rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold">
                        <Upload size={18} /> Export
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => importRef.current?.click()} className="glass rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold">
                        <Download size={18} /> Import
                      </motion.button>
                    </div>
                  </section>

                  <section>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Add store</p>
                    <div className="flex gap-2">
                      <input
                        value={newStoreName}
                        onChange={e => setNewStoreName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addStore() }}
                        placeholder="New store name"
                        className="glass rounded-xl p-3 flex-1 outline-none"
                      />
                      <motion.button whileTap={{ scale: 0.9 }} onClick={addStore} className="bg-white text-black rounded-xl px-4 font-semibold">
                        Add
                      </motion.button>
                    </div>
                  </section>

                  <section>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Stores</p>
                    <div className="space-y-2">
                      {stores.map(s => (
                        <div key={s} className="glass rounded-2xl p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{s}</div>
                            <div className="text-xs text-zinc-500">{(lists[s] || []).length} saved item(s)</div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteStore(s)}
                            className="rounded-xl p-2 text-red-300 hover:bg-red-500/15 transition"
                            title={`Delete ${s}`}
                          >
                            <Trash2 size={17} />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items */}
        <div className="space-y-3">
          {toBuy.length === 0 && bought.length === 0 && (
            <div className="glass rounded-3xl p-10 text-center text-zinc-400">
              Your {activeStore} run is looking empty.
            </div>
          )}

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
                    className="glass rounded-3xl p-5 mb-2"
                  >
                    {editingId === i.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                          className="glass rounded-xl p-2 flex-1 outline-none text-base"
                        />
                        <input
                          type="number"
                          min="1"
                          value={editQty}
                          onChange={e => setEditQty(Number(e.target.value))}
                          className="glass rounded-xl p-2 w-16 outline-none text-base"
                        />
                        <motion.button whileTap={{ scale: 0.9 }} onClick={saveEdit} className="bg-white text-black rounded-xl px-3 py-2 font-semibold text-sm">Save</motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingId(null)} className="glass rounded-xl p-2 opacity-60"><X size={14} /></motion.button>
                      </div>
                    ) : movingId === i.id ? (
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-sm opacity-60">Move to:</span>
                        {stores.filter(s => s !== activeStore).map(s => (
                          <motion.button
                            key={s}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => moveItem(i.id, s)}
                            className="glass rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-white hover:text-black transition"
                          >
                            {s}
                          </motion.button>
                        ))}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMovingId(null)} className="ml-auto glass rounded-xl p-1.5 opacity-60"><X size={14} /></motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleItem(i.id)}
                            className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-white/70 transition-colors"
                          />
                          <div>
                            <div className="text-lg font-medium">{i.name}</div>
                            <div className="text-sm text-zinc-400">Quantity: {i.qty}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => startEdit(i)} className="opacity-40 hover:opacity-100 transition"><Pencil size={16} /></motion.button>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setMovingId(i.id); setEditingId(null) }} className="opacity-40 hover:opacity-100 transition"><MoveRight size={16} /></motion.button>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => deleteItem(i.id)} className="opacity-40 hover:opacity-100 transition"><Trash2 size={18} /></motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {bought.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Bought</p>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={clearBought}
                  className="text-xs text-zinc-500 hover:text-red-400 transition"
                >
                  Clear bought
                </motion.button>
              </div>
              <AnimatePresence initial={false}>
                {bought.map(i => (
                  <motion.div
                    key={i.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 0.45, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    className="glass rounded-3xl p-5 mb-2"
                  >
                    {editingId === i.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                          className="glass rounded-xl p-2 flex-1 outline-none text-base"
                        />
                        <input
                          type="number"
                          min="1"
                          value={editQty}
                          onChange={e => setEditQty(Number(e.target.value))}
                          className="glass rounded-xl p-2 w-16 outline-none text-base"
                        />
                        <motion.button whileTap={{ scale: 0.9 }} onClick={saveEdit} className="bg-white text-black rounded-xl px-3 py-2 font-semibold text-sm">Save</motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingId(null)} className="glass rounded-xl p-2 opacity-60"><X size={14} /></motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleItem(i.id)}
                            className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center"
                          >
                            <Check size={14} className="text-black" strokeWidth={3} />
                          </motion.button>
                          <div className="line-through">
                            <div className="text-lg font-medium">{i.name}</div>
                            <div className="text-sm text-zinc-400">Quantity: {i.qty}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => startEdit(i)} className="opacity-40 hover:opacity-100 transition"><Pencil size={16} /></motion.button>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => deleteItem(i.id)} className="opacity-40 hover:opacity-100 transition"><Trash2 size={18} /></motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
