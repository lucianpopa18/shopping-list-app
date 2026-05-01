
import { useEffect, useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'

const stores = [
  'Albert Heijn',
  'Polish Shop',
  'Jumbo',
  'Lidl',
  'Kruidvat',
  'Action',
]

const defaultData = Object.fromEntries(stores.map(store => [store, []]))

export default function App() {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('shopping-list-data')
    return saved ? JSON.parse(saved) : defaultData
  })

  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [store, setStore] = useState(stores[0])
  const [activeStore, setActiveStore] = useState(stores[0])
  const [search, setSearch] = useState('')

  useEffect(() => {
    localStorage.setItem('shopping-list-data', JSON.stringify(lists))
  }, [lists])

  const addItem = () => {
    if (!product.trim()) return

    const newItem = {
      id: Date.now(),
      name: product,
      quantity,
      completed: false,
    }

    setLists(prev => ({
      ...prev,
      [store]: [...prev[store], newItem],
    }))

    setProduct('')
    setQuantity(1)
  }

  const toggleComplete = id => {
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].map(item =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      ),
    }))
  }

  const deleteItem = id => {
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].filter(item => item.id !== id),
    }))
  }

  const editItem = id => {
    const newName = prompt('Edit item')
    if (!newName) return

    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].map(item =>
        item.id === id ? { ...item, name: newName } : item
      ),
    }))
  }

  const clearCompleted = () => {
    setLists(prev => ({
      ...prev,
      [activeStore]: prev[activeStore].filter(item => !item.completed),
    }))
  }

  const filteredItems = lists[activeStore].filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Shopping List
        </h1>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={product}
              onChange={e => setProduct(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add product..."
              className="flex-1 border rounded-xl px-4 py-2"
            />

            <input
              type="number"
              value={quantity}
              min="1"
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-20 border rounded-xl px-2 py-2"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={store}
              onChange={e => setStore(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-2"
            >
              {stores.map(store => (
                <option key={store}>{store}</option>
              ))}
            </select>

            <button
              onClick={addItem}
              className="bg-black text-white px-6 py-2 rounded-xl hover:opacity-90 transition"
            >
              Add
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 border rounded-xl px-4 py-2"
        />

        <div className="flex gap-2 overflow-x-auto mb-6">
          {stores.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveStore(tab)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition ${
                activeStore === tab
                  ? 'bg-black text-white'
                  : 'bg-white border'
              }`}
            >
              {tab} ({lists[tab].length})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center text-zinc-500 py-10">
              No items yet for {activeStore}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleComplete(item.id)}
                    />

                    <div
                      className={item.completed ? 'line-through opacity-50' : ''}
                    >
                      {item.name} × {item.quantity}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => editItem(item.id)}>
                      <Pencil size={18} />
                    </button>

                    <button onClick={() => deleteItem(item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={clearCompleted}
            className="mt-4 w-full border rounded-xl py-2 hover:bg-zinc-100 transition"
          >
            Clear completed
          </button>
        </div>
      </div>
    </div>
  )
}
