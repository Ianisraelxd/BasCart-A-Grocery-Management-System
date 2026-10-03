import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const KEY = 'bascart-a-db-v1'
const SESSION = 'bascart-a-user'

export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '—')
export const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA')
const nowIso = () => new Date().toISOString()

export const ROLES = ['Store Manager', 'Inventory Manager', 'Purchasing Manager', 'Sales Manager', 'Cashier', 'Customer Service', 'Finance Manager', 'HR/Admin']

// Data Governance rule 1: access by job role.
export const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '🧭' },
  { id: 'pos', label: 'Point of Sale', icon: '🛒' },
  { id: 'online', label: 'Online Orders', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🍎' },
  { id: 'inventory', label: 'Inventory', icon: '🧱' },
  { id: 'suppliers', label: 'Suppliers', icon: '🚚' },
  { id: 'purchasing', label: 'Purchasing', icon: '📜' },
  { id: 'customers', label: 'Customers', icon: '🧑' },
  { id: 'sales', label: 'Sales', icon: '💎' },
  { id: 'finance', label: 'Finance', icon: '🪙' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'employees', label: 'Employees', icon: '👷' },
  { id: 'audit', label: 'Audit Log', icon: '🔍' },
  { id: 'backup', label: 'Backup', icon: '💾' },
]
const ACCESS = {
  'Store Manager': MODULES.map((m) => m.id),
  'Inventory Manager': ['dashboard', 'products', 'inventory', 'reports'],
  'Purchasing Manager': ['dashboard', 'suppliers', 'purchasing', 'inventory', 'reports'],
  'Sales Manager': ['dashboard', 'pos', 'sales', 'customers', 'reports'],
  Cashier: ['dashboard', 'pos'],
  'Customer Service': ['dashboard', 'customers', 'online'],
  'Finance Manager': ['dashboard', 'sales', 'finance', 'reports'],
  'HR/Admin': ['dashboard', 'employees', 'audit'],
}
export const canAccess = (role, mod) => (ACCESS[role] || []).includes(mod)

const SEED_PRODUCTS = [
  ['P1001', 'Jasmine Rice 5kg', 'Grains & Pantry', 'sack', 210, 265, 40, 15],
  ['P1002', 'Cooking Oil 1L', 'Grains & Pantry', 'bottle', 85, 110, 36, 12],
  ['P1003', 'White Sugar 1kg', 'Grains & Pantry', 'pack', 62, 78, 30, 10],
  ['P1004', 'Iodized Salt 500g', 'Grains & Pantry', 'pack', 12, 18, 50, 15],
  ['P1005', 'Soy Sauce 385ml', 'Grains & Pantry', 'bottle', 20, 28, 45, 12],
  ['P1006', 'Spaghetti Pasta 900g', 'Grains & Pantry', 'pack', 70, 92, 8, 10],
  ['P2001', 'Fresh Milk 1L', 'Dairy & Eggs', 'carton', 88, 115, 24, 10],
  ['P2002', 'Eggs (tray of 30)', 'Dairy & Eggs', 'tray', 195, 235, 14, 6],
  ['P2003', 'Salted Butter 200g', 'Dairy & Eggs', 'bar', 78, 99, 18, 6],
  ['P3001', 'Cola 1.5L', 'Beverages', 'bottle', 52, 72, 48, 18],
  ['P3002', 'Bottled Water 500ml', 'Beverages', 'bottle', 8, 15, 120, 40],
  ['P3003', 'Instant Coffee 3-in-1 (30s)', 'Beverages', 'pack', 95, 125, 22, 8],
  ['P3004', 'Orange Juice 1L', 'Beverages', 'carton', 62, 85, 5, 8],
  ['P4001', 'Instant Noodles Cup', 'Snacks', 'cup', 14, 22, 80, 30],
  ['P4002', 'Potato Chips 60g', 'Snacks', 'pack', 24, 35, 60, 20],
  ['P4003', 'Chocolate Biscuits', 'Snacks', 'pack', 30, 44, 35, 12],
  ['P5001', 'Frozen Chicken Nuggets 1kg', 'Frozen Goods', 'pack', 190, 245, 12, 5],
  ['P5002', 'Frozen Hotdog 1kg', 'Frozen Goods', 'pack', 150, 195, 16, 6],
  ['P5003', 'Ice Cream Tub 1.5L', 'Frozen Goods', 'tub', 160, 215, 0, 4],
  ['P6001', 'Dishwashing Liquid 500ml', 'Household', 'bottle', 45, 62, 26, 8],
  ['P6002', 'Laundry Detergent 1kg', 'Household', 'pack', 98, 130, 20, 8],
  ['P6003', 'Tissue Roll (4 pack)', 'Household', 'pack', 42, 58, 32, 10],
  ['P7001', 'Bath Soap', 'Personal Care', 'bar', 22, 32, 44, 15],
  ['P7002', 'Shampoo Sachet (12s)', 'Personal Care', 'strip', 32, 45, 38, 12],
  ['P7003', 'Toothpaste 100ml', 'Personal Care', 'tube', 48, 68, 9, 10],
]

function seed() {
  const t = nowIso()
  const products = SEED_PRODUCTS.map(([code, name, category, unit, cost, price, stock, reorder], i) => ({
    id: 'PRD-' + (i + 1), code, name, category, unit, cost, price, stock, reorder, status: 'Active',
  }))
  return {
    seq: { sale: 1000, po: 1000, order: 1000, mov: products.length, pay: 0, fin: 0, id: 100 },
    products,
    movements: products.map((p, i) => ({ id: 'MOV-' + (i + 1), productId: p.id, qty: p.stock, balance: p.stock, type: 'Opening Stock', ref: 'SEED', by: 'System', at: t })),
    suppliers: [
      { id: 'SUP-1', name: 'Golden Harvest Trading', contact: 'Rico Valdez', phone: '0917-555-0101', email: 'orders@goldenharvest.example', terms: 'Net 15', supplies: 'Rice, sugar, salt, cooking oil' },
      { id: 'SUP-2', name: 'FreshFarm Dairy Co.', contact: 'Elena Cruz', phone: '0918-555-0102', email: 'sales@freshfarm.example', terms: 'COD', supplies: 'Milk, eggs, butter' },
      { id: 'SUP-3', name: 'Metro Beverage Distributors', contact: 'Jun Aquino', phone: '0919-555-0103', email: 'metro@bevdist.example', terms: 'Net 30', supplies: 'Soft drinks, water, juice, coffee' },
      { id: 'SUP-4', name: 'HomeCare & Frozen Supply', contact: 'Mia Lim', phone: '0920-555-0104', email: 'mia@homecare.example', terms: 'Net 15', supplies: 'Frozen goods, household, personal care' },
    ],
    purchaseOrders: [],
    customers: [
      { id: 'CUS-1', name: 'Walk-in Customer', phone: '', email: '', address: '' },
      { id: 'CUS-2', name: 'Lorna Mendoza', phone: '0917-123-4567', email: 'lorna@example.com', address: 'Blk 4 Lot 7, Banay-banay, Cabuyao, Laguna' },
      { id: 'CUS-3', name: 'Carinderia ni Aling Nena', phone: '0928-765-4321', email: '', address: 'Brgy. Mamatid, Cabuyao, Laguna' },
    ],
    sales: [],
    payments: [],
    orders: [],
    finance: [],
    employees: ROLES.map((role, i) => ({
      id: 'EMP-' + (i + 1),
      name: ['Maria Santos', 'Ian Reyes', 'Paolo Cruz', 'Liza Gomez', 'Ben Torres', 'Ana Lopez', 'Carla Diaz', 'Noel Ramos'][i],
      role, status: 'Active', schedule: i === 4 ? 'Mon–Sat 2PM–10PM' : 'Mon–Fri 8AM–5PM', pin: '1234',
    })),
    audit: [{ id: 'AUD-1', at: t, user: 'System', action: 'Initialize', entity: 'System', detail: 'Database created with demo data' }],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* fall through to seed */ }
  return seed()
}

const next = (d, k, prefix) => `${prefix}-${++d.seq[k]}`
function audit(d, u, action, entity, detail) {
  d.audit.unshift({ id: next(d, 'id', 'AUD'), at: nowIso(), user: u?.name || 'System', action, entity, detail })
  d.audit.length = Math.min(d.audit.length, 1000)
}
function move(d, u, product, qty, type, ref, reason = '') {
  if (product.stock + qty < 0) throw new Error(`Not enough stock for ${product.name} (available: ${product.stock}).`)
  product.stock += qty
  d.movements.unshift({ id: next(d, 'mov', 'MOV'), productId: product.id, qty, balance: product.stock, type, ref, reason, by: u?.name || 'System', at: nowIso() })
  d.movements.length = Math.min(d.movements.length, 2000)
}
const need = (cond, msg) => { if (!cond) throw new Error(msg) }
const posInt = (n) => Number.isInteger(n) && n > 0

function recordSale(d, u, { id, items, method, ref, tendered, customerId, channel, orderId }) {
  const lines = items.map((it) => {
    const p = d.products.find((x) => x.id === it.productId)
    return { productId: p.id, code: p.code, name: p.name, qty: it.qty, price: p.price, cost: p.cost }
  })
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0)
  const sale = { id: id || next(d, 'sale', 'SAL'), at: nowIso(), channel, orderId: orderId || null, customerId: customerId || 'CUS-1', cashier: u?.name || 'System', method, ref: ref || '', tendered: tendered ?? total, change: Math.max(0, (tendered ?? total) - total), lines, total }
  d.sales.unshift(sale)
  d.finance.unshift({ id: next(d, 'fin', 'FIN'), at: sale.at, type: 'Revenue', amount: total, ref: sale.id, desc: `${channel} sale` })
  return sale
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)
  const [userId, setUserId] = useState(() => sessionStorage.getItem(SESSION))
  const dbRef = useRef(db)
  const user = db.employees.find((e) => e.id === userId && e.status === 'Active') || null
  const userRef = useRef(user)
  useEffect(() => { userRef.current = user }, [user])

  const run = useCallback((fn) => {
    try {
      const d = structuredClone(dbRef.current)
      const data = fn(d, userRef.current)
      dbRef.current = d
      setDb(d)
      try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* storage unavailable */ }
      return { ok: true, data }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }, [])

  const act = useMemo(() => ({
    saveProduct: (p) => run((d, u) => {
      const code = String(p.code).trim().toUpperCase(), name = String(p.name).trim()
      const price = Number(p.price), cost = Number(p.cost), reorder = Number(p.reorder)
      need(code && name, 'Product code and name are required.')
      need(price > 0, 'Price must be greater than 0.')
      need(cost >= 0 && !Number.isNaN(cost), 'Cost must be 0 or more.')
      need(Number.isInteger(reorder) && reorder >= 0, 'Reorder level must be a whole number, 0 or more.')
      need(!d.products.some((x) => x.code === code && x.id !== p.id), 'Product code already exists.')
      const fields = { code, name, category: p.category.trim() || 'General', unit: p.unit.trim() || 'pc', cost, price, reorder, status: p.status }
      if (p.id) {
        Object.assign(d.products.find((x) => x.id === p.id), fields)
        audit(d, u, 'Update', 'Product', `${code} ${name} updated`)
      } else {
        const stock = Number(p.stock || 0)
        need(Number.isInteger(stock) && stock >= 0, 'Opening stock must be a whole number, 0 or more.')
        const np = { id: next(d, 'id', 'PRD'), ...fields, stock: 0 }
        d.products.push(np)
        if (stock > 0) move(d, u, np, stock, 'Opening Stock', 'NEW')
        audit(d, u, 'Create', 'Product', `${code} ${name} created`)
      }
    }),
    adjustStock: (productId, delta, reason) => run((d, u) => {
      need(Number.isInteger(delta) && delta !== 0, 'Adjustment must be a non-zero whole number.')
      need(reason.trim(), 'A reason is required for stock adjustments.')
      const p = d.products.find((x) => x.id === productId)
      move(d, u, p, delta, 'Adjustment', 'Manual', reason.trim())
      audit(d, u, 'Adjust', 'Inventory', `${p.code} ${delta > 0 ? '+' : ''}${delta}: ${reason.trim()}`)
    }),
    saveSupplier: (s) => run((d, u) => {
      need(s.name.trim(), 'Supplier name is required.')
      need(s.phone.trim() || s.email.trim(), 'Provide a phone or email contact.')
      if (s.id) Object.assign(d.suppliers.find((x) => x.id === s.id), s)
      else d.suppliers.push({ ...s, id: next(d, 'id', 'SUP') })
      audit(d, u, s.id ? 'Update' : 'Create', 'Supplier', s.name)
    }),
    saveCustomer: (c) => run((d, u) => {
      need(c.name.trim(), 'Customer name is required.')
      let id = c.id
      if (id) Object.assign(d.customers.find((x) => x.id === id), c)
      else { id = next(d, 'id', 'CUS'); d.customers.push({ ...c, id }) }
      audit(d, u, c.id ? 'Update' : 'Create', 'Customer', c.name)
      return id
    }),
    saveEmployee: (e) => run((d, u) => {
      need(e.name.trim(), 'Employee name is required.')
      need(/^\d{4}$/.test(e.pin), 'PIN must be exactly 4 digits.')
      need(ROLES.includes(e.role), 'Choose a valid role.')
      if (e.id) {
        need(!(e.id === u?.id && e.status !== 'Active'), 'You cannot deactivate your own account.')
        need(!(e.id === u?.id && e.role !== u.role), 'You cannot change your own role.')
        Object.assign(d.employees.find((x) => x.id === e.id), e)
      } else d.employees.push({ ...e, id: next(d, 'id', 'EMP') })
      audit(d, u, e.id ? 'Update' : 'Create', 'Employee', `${e.name} (${e.role}, ${e.status})`)
    }),

    // Flow 1: Review stock -> PO -> send -> receive -> record purchase
    createPO: ({ supplierId, items }) => run((d, u) => {
      need(supplierId, 'Choose a supplier.')
      need(items.length, 'Add at least one item.')
      items.forEach((i) => { need(posInt(i.qty), 'Quantities must be whole numbers above 0.'); need(i.cost >= 0, 'Unit cost cannot be negative.') })
      const po = { id: next(d, 'po', 'PO'), supplierId, items, status: 'Draft', createdAt: nowIso(), createdBy: u.name, total: items.reduce((s, i) => s + i.qty * i.cost, 0) }
      d.purchaseOrders.unshift(po)
      audit(d, u, 'Create', 'Purchase Order', `${po.id} total ${peso(po.total)}`)
    }),
    setPOStatus: (id, status) => run((d, u) => {
      const po = d.purchaseOrders.find((x) => x.id === id)
      const allowed = { Sent: ['Draft'], Received: ['Sent'], Cancelled: ['Draft', 'Sent'] }
      need(allowed[status].includes(po.status), `Cannot change a ${po.status} order to ${status}.`)
      if (status === 'Received') {
        po.items.forEach((i) => {
          const p = d.products.find((x) => x.id === i.productId)
          move(d, u, p, i.qty, 'Purchase Received', po.id)
          p.cost = i.cost
        })
        d.finance.unshift({ id: next(d, 'fin', 'FIN'), at: nowIso(), type: 'Expense', amount: po.total, ref: po.id, desc: 'Purchase received' })
        po.receivedAt = nowIso()
      }
      if (status === 'Sent') po.sentAt = nowIso()
      po.status = status
      audit(d, u, status, 'Purchase Order', po.id)
    }),

    // Flow 3: POS
    checkout: ({ items, method, ref, tendered, customerId }) => run((d, u) => {
      need(items.length, 'The cart is empty.')
      const saleId = next(d, 'sale', 'SAL')
      items.forEach((it) => {
        const p = d.products.find((x) => x.id === it.productId)
        need(p && p.status === 'Active', 'A product in the cart is no longer available.')
        need(posInt(it.qty), 'Invalid quantity.')
        move(d, u, p, -it.qty, 'Sale', saleId)
      })
      const total = items.reduce((s, it) => s + it.qty * d.products.find((x) => x.id === it.productId).price, 0)
      if (method === 'Cash') need(tendered >= total, 'Cash tendered is less than the total.')
      else need(String(ref).trim(), `A ${method} reference number is required.`)
      const sale = recordSale(d, u, { id: saleId, items, method, ref, tendered: method === 'Cash' ? tendered : total, customerId, channel: 'Store' })
      d.payments.unshift({ id: next(d, 'pay', 'PAY'), at: sale.at, method, amount: total, ref: ref || sale.id, status: 'Paid', saleId: sale.id })
      audit(d, u, 'Sale', 'POS', `${sale.id} ${peso(total)} via ${method}`)
      return sale
    }),

    // Flow 4: Online order and delivery
    placeOrder: ({ customerId, items, address, method }) => run((d, u) => {
      need(customerId, 'Choose a customer.')
      need(address.trim(), 'Delivery address is required.')
      need(items.length, 'Add at least one item.')
      const id = next(d, 'order', 'ORD')
      items.forEach((it) => {
        const p = d.products.find((x) => x.id === it.productId)
        need(p.status === 'Active', `${p.name} is not available.`)
        need(posInt(it.qty), 'Quantities must be whole numbers above 0.')
        move(d, u, p, -it.qty, 'Online Reserve', id)
      })
      const total = items.reduce((s, it) => s + it.qty * d.products.find((x) => x.id === it.productId).price, 0)
      d.orders.unshift({ id, customerId, items, address: address.trim(), method, total, status: 'Pending', createdAt: nowIso(), history: [{ status: 'Pending', at: nowIso(), by: u.name }] })
      d.payments.unshift({ id: next(d, 'pay', 'PAY'), at: nowIso(), method, amount: total, ref: id, status: 'Pending', orderId: id })
      audit(d, u, 'Create', 'Online Order', `${id} ${peso(total)}`)
    }),
    setOrderStatus: (id, status) => run((d, u) => {
      const o = d.orders.find((x) => x.id === id)
      const flow = { Preparing: ['Pending'], 'Out for Delivery': ['Preparing'], Delivered: ['Out for Delivery'], Cancelled: ['Pending', 'Preparing', 'Out for Delivery'] }
      need(flow[status].includes(o.status), `Cannot change a ${o.status} order to ${status}.`)
      const pay = d.payments.find((p) => p.orderId === id)
      if (status === 'Cancelled') {
        o.items.forEach((it) => move(d, u, d.products.find((x) => x.id === it.productId), it.qty, 'Order Cancelled', id))
        pay.status = 'Cancelled'
      }
      if (status === 'Delivered') {
        const sale = recordSale(d, u, { items: o.items, method: o.method, ref: id, customerId: o.customerId, channel: 'Online', orderId: id })
        o.saleId = sale.id
        pay.status = 'Paid'
        pay.saleId = sale.id
      }
      o.status = status
      o.history.push({ status, at: nowIso(), by: u.name })
      audit(d, u, status, 'Online Order', id)
    }),

    exportData: () => JSON.stringify(dbRef.current, null, 2),
  }), [run])

  const importData = useCallback((text) => {
    try {
      const parsed = JSON.parse(text)
      if (!parsed.products || !parsed.employees || !parsed.seq) throw new Error('This is not a BasCart-A backup file.')
      parsed.audit = [{ id: 'AUD-R' + Date.now(), at: nowIso(), user: userRef.current?.name || 'System', action: 'Restore', entity: 'System', detail: 'Data restored from backup' }, ...(parsed.audit || [])]
      dbRef.current = parsed
      setDb(parsed)
      localStorage.setItem(KEY, JSON.stringify(parsed))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }, [])
  const resetData = useCallback(() => {
    const d = seed()
    dbRef.current = d
    setDb(d)
    localStorage.setItem(KEY, JSON.stringify(d))
    sessionStorage.removeItem(SESSION)
    setUserId(null)
  }, [])

  const login = useCallback((id, pin) => {
    const e = dbRef.current.employees.find((x) => x.id === id)
    if (!e || e.status !== 'Active' || e.pin !== pin) return { ok: false, error: 'Wrong PIN or inactive account.' }
    sessionStorage.setItem(SESSION, id)
    setUserId(id)
    run((d) => audit(d, e, 'Login', 'Session', `${e.name} signed in`))
    return { ok: true }
  }, [run])
  const logout = useCallback(() => {
    run((d, u) => audit(d, u, 'Logout', 'Session', `${u?.name} signed out`))
    sessionStorage.removeItem(SESSION)
    setUserId(null)
  }, [run])

  const value = useMemo(() => ({ db, user, act: { ...act, importData }, login, logout, resetData }), [db, user, act, importData, login, logout, resetData])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
