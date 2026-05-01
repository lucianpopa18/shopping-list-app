
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check } from 'lucide-react'

const stores = [
  'Albert Heijn',
  'Polish Shop',
  'Jumbo',
  'Lidl',
  'Kruidvat',
  'Action'
]

export default function App() {
  const [lists, setLists] = useState(() => {
    return JSON.parse(localStorage.getItem('premium-shopping')) || {}
  })
  const [item, setItem]           = useState('')
  const [qty, setQty]             = useState(1)
  const [store, setStore]         = useState(stores[0])
  const [activeStore, setActiveStore] = useState(stores[0])

  useEffect(() => {
    localStorage.setItem('premium-shopping', JSON.stringify(lists))
  }, [lists])

  const addItem = () => {
    if (!item.trim()) return
    const newItem = { id: Date.now(), name: item, qty, completed: false }
    setLists(prev => ({
      ...prev,
      [store]: [...(prev[store] || []), newItem]
    }))
    setItem('')
    setQty(1)
  }

  const toggleItem = id => {
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].map(i =>
        i.id === id ? { ...i, completed: !i.completed } : i
      )
    }))
  }

  const deleteItem = id => {
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].filter(i => i.id !== id)
    }))
  }

  const allItems = lists[activeStore] || []
  const toBuy    = allItems.filter(i => !i.completed)
  const bought   = allItems.filter(i => i.completed)

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
            <div>
              <h1 className="text-4xl font-bold">Shopping List</h1>
              <p className="text-zinc-400">Ultra Premium Grocery Experience</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              value={item}
              onChange={e => setItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add something beautiful..."
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
                {stores.map(s => (
                  <option key={s} className="text-black">{s}</option>
                ))}
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

        {/* Store tabs — wrapped grid, 2 per row */}
        <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3">
          {stores.map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveStore(s)}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                activeStore === s
                  ? 'bg-white text-black'
                  : 'glass'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Active store list */}
        <div className="space-y-3">

          {/* To Buy */}
          {toBuy.length === 0 && bought.length === 0 && (
            <div className="glass rounded-3xl p-10 text-center text-zinc-400">
              Your {activeStore} run is looking empty.
            </div>
          )}

          {toBuy.length > 0 && (
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
                To Buy
              </p>
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
                        onClick={() => toggleItem(i.id)}
                        className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-white/70 transition-colors"
                      />
                      <div>
                        <div className="text-lg font-medium">{i.name}</div>
                        <div className="text-sm text-zinc-400">Quantity: {i.qty}</div>
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
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">
                Bought
              </p>
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
      </div>
    </div>
  )
}
