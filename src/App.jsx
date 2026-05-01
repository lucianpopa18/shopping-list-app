
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

  const [item, setItem] = useState('')
  const [qty, setQty] = useState(1)
  const [store, setStore] = useState(stores[0])
  const [activeStore, setActiveStore] = useState(stores[0])

  useEffect(() => {
    localStorage.setItem('premium-shopping', JSON.stringify(lists))
  }, [lists])

  const addItem = () => {
    if (!item.trim()) return

    const newItem = {
      id: Date.now(),
      name: item,
      qty,
      completed: false
    }

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

  const currentItems = lists[activeStore] || []

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sticky top-4 z-10 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">Shopping List</h1>
              <p className="text-zinc-400">
                Ultra Premium Grocery Experience
              </p>
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

        <div className="flex gap-3 overflow-auto pb-3 mb-6">
          {stores.map(s => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={s}
              onClick={() => setActiveStore(s)}
              className={`px-5 py-3 rounded-2xl whitespace-nowrap transition-all ${
                activeStore === s
                  ? 'bg-white text-black'
                  : 'glass'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          {currentItems.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-zinc-400">
              Your {activeStore} run is looking empty.
            </div>
          ) : (
            currentItems.map((i, index) => (
              <motion.div
                key={i.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-3xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleItem(i.id)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                      i.completed ? 'bg-green-400 text-black' : ''
                    }`}
                  >
                    {i.completed && <Check size={16} />}
                  </button>

                  <div className={i.completed ? 'line-through opacity-50' : ''}>
                    <div className="text-lg font-medium">{i.name}</div>
                    <div className="text-sm text-zinc-400">
                      Quantity: {i.qty}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteItem(i.id)}
                  className="opacity-70 hover:opacity-100 transition"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
