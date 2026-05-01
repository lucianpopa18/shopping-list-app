
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Store } from 'lucide-react'

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
    return JSON.parse(localStorage.getItem('shopping-v2')) || {}
  })

  const [item, setItem] = useState('')
  const [qty, setQty] = useState(1)
  const [store, setStore] = useState(stores[0])

  useEffect(() => {
    localStorage.setItem('shopping-v2', JSON.stringify(lists))
  }, [lists])

  const addItem = () => {
    if (!item.trim()) return

    const newItem = {
      id: Date.now(),
      name: item,
      qty,
      completed: false,
    }

    setLists(prev => ({
      ...prev,
      [store]: [...(prev[store] || []), newItem],
    }))

    setItem('')
    setQty(1)
  }

  const toggleItem = (storeName, id) => {
    setLists(prev => ({
      ...prev,
      [storeName]: prev[storeName].map(i =>
        i.id === id ? { ...i, completed: !i.completed } : i
      ),
    }))
  }

  const deleteItem = (storeName, id) => {
    setLists(prev => ({
      ...prev,
      [storeName]: prev[storeName].filter(i => i.id !== id),
    }))
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[32px] p-6 sticky top-4 z-50 mb-8"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            Shopping List
          </h1>

          <p className="text-zinc-400 mb-6">
            Premium Grocery Experience
          </p>

          <div className="space-y-3">
            <input
              value={item}
              onChange={e => setItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add something beautiful..."
              className="glass w-full rounded-2xl p-4 text-lg outline-none"
            />

            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="glass rounded-2xl p-4 w-24 outline-none"
              />

              <select
                value={store}
                onChange={e => setStore(e.target.value)}
                className="glass rounded-2xl p-4 flex-1 bg-transparent outline-none"
              >
                {stores.map(s => (
                  <option key={s} className="text-black">
                    {s}
                  </option>
                ))}
              </select>

              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.03 }}
                onClick={addItem}
                className="bg-white text-black rounded-2xl px-6 font-semibold"
              >
                Add
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {stores.map(storeName => {
            const items = lists[storeName] || []
            const todo = items.filter(i => !i.completed)
            const bought = items.filter(i => i.completed)

            return (
              <motion.div
                key={storeName}
                layout
                className="glass rounded-[32px] p-5"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Store size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold">
                      {storeName}
                    </h2>

                    <p className="text-zinc-400 text-sm">
                      {items.length} items
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-zinc-400 text-sm uppercase tracking-widest mb-3">
                    To Buy
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {todo.length === 0 && (
                        <div className="text-zinc-500 text-sm px-2 py-3">
                          Nothing to buy yet.
                        </div>
                      )}

                      {todo.map(i => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={i.id}
                          className="glass rounded-2xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleItem(storeName, i.id)}
                              className="w-7 h-7 rounded-full border border-white/20"
                            />

                            <div>
                              <div className="text-lg font-medium">
                                {i.name}
                              </div>

                              <div className="text-zinc-400 text-sm">
                                Quantity: {i.qty}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteItem(storeName, i.id)}
                            className="opacity-70 hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-sm uppercase tracking-widest mb-3">
                    Bought
                  </div>

                  <div className="space-y-3 opacity-70">
                    <AnimatePresence>
                      {bought.length === 0 && (
                        <div className="text-zinc-600 text-sm px-2 py-3">
                          Nothing bought yet.
                        </div>
                      )}

                      {bought.map(i => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          key={i.id}
                          className="glass rounded-2xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleItem(storeName, i.id)}
                              className="w-7 h-7 rounded-full bg-green-400 text-black flex items-center justify-center"
                            >
                              <Check size={16} />
                            </button>

                            <div className="line-through">
                              <div className="text-lg font-medium">
                                {i.name}
                              </div>

                              <div className="text-zinc-400 text-sm">
                                Quantity: {i.qty}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteItem(storeName, i.id)}
                            className="opacity-70 hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
