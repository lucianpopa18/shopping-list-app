
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, ShoppingCart } from 'lucide-react'

const stores = [
  'Albert Heijn',
  'Polish Shop',
  'Jumbo',
  'Lidl',
  'Kruidvat',
  'Action'
]

function ItemRow({ item, storeName, onToggle, onDelete, bought }) {
  return (
    <motion.div
      layout
      layoutId={`item-${item.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: bought ? 0.45 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => onToggle(storeName, item.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            bought
              ? 'bg-emerald-400 border-emerald-400'
              : 'border border-white/30 hover:border-white/70'
          }`}
        >
          {bought && <Check size={12} className="text-black" strokeWidth={3} />}
        </motion.button>
        <div className={`min-w-0 ${bought ? 'line-through' : ''}`}>
          <div className="text-sm font-medium truncate">{item.name}</div>
          <div className="text-xs text-zinc-500">Qty: {item.qty}</div>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.82 }}
        onClick={() => onDelete(storeName, item.id)}
        className="flex-shrink-0 ml-2 opacity-25 hover:opacity-80 transition-opacity"
      >
        <Trash2 size={13} />
      </motion.button>
    </motion.div>
  )
}

function StoreCard({ storeName, items, onToggle, onDelete }) {
  const toBuy  = items.filter(i => !i.completed)
  const bought = items.filter(i => i.completed)

  return (
    <motion.div layout className="glass rounded-3xl p-5 flex flex-col gap-3 h-full">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold leading-tight">{storeName}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''}
            {bought.length > 0 && ` · ${bought.length} done`}
          </p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center">
          <ShoppingCart size={15} className="text-zinc-300" />
        </div>
      </div>

      {/* To Buy */}
      {(toBuy.length > 0 || items.length === 0) && (
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
            To Buy
          </p>
          {toBuy.length === 0 ? (
            <p className="text-xs text-zinc-700 py-1">Nothing left to buy.</p>
          ) : (
            <AnimatePresence initial={false}>
              {toBuy.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  storeName={storeName}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  bought={false}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <p className="text-xs text-zinc-700 text-center py-2">Empty list</p>
      )}

      {/* Bought */}
      {bought.length > 0 && (
        <div className="mt-1 pt-3 border-t border-white/5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
            Bought
          </p>
          <AnimatePresence initial={false}>
            {bought.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                storeName={storeName}
                onToggle={onToggle}
                onDelete={onDelete}
                bought={true}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default function App() {
  const [lists, setLists] = useState(() => {
    return JSON.parse(localStorage.getItem('premium-shopping')) || {}
  })
  const [item, setItem]   = useState('')
  const [qty, setQty]     = useState(1)
  const [store, setStore] = useState(stores[0])

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

  const toggleItem = (storeName, id) => {
    setLists(prev => ({
      ...prev,
      [storeName]: prev[storeName].map(i =>
        i.id === id ? { ...i, completed: !i.completed } : i
      )
    }))
  }

  const deleteItem = (storeName, id) => {
    setLists(prev => ({
      ...prev,
      [storeName]: prev[storeName].filter(i => i.id !== id)
    }))
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">

        {/* Sticky add-item card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sticky top-4 z-10 mb-8"
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

        {/* Store cards — 3 per row */}
        <div className="grid grid-cols-3 gap-4">
          {stores.map((s, index) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
            >
              <StoreCard
                storeName={s}
                items={lists[s] || []}
                onToggle={toggleItem}
                onDelete={deleteItem}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
