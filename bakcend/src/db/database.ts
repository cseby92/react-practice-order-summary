import Database from 'better-sqlite3';
import { Order, Item, Coupon, CATEGORIES } from '../types';

// In-memory DB
const db = new Database(':memory:');

// Táblák létrehozása
db.exec(`
CREATE TABLE coupons (
    id INTEGER PRIMARY KEY,
    code TEXT,
    discount INTEGER,
    appliesTo TEXT
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    createdAt TEXT,
    couponId INTEGER,
    FOREIGN KEY (couponId) REFERENCES coupons(id)
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    orderId INTEGER,
    name TEXT,
    price REAL,
    quantity INTEGER,
    category TEXT,
    FOREIGN KEY (orderId) REFERENCES orders(id)
);
`);

// Kamu kuponok
const coupons: Coupon[] = [
    { id: 1, code: 'SUMMER10', discount: 10, appliesTo: ['electronics'] },
    { id: 2, code: 'ALL5', discount: 5 },
];

// Insert kuponok
const insertCoupon = db.prepare(
    'INSERT INTO coupons (id, code, discount, appliesTo) VALUES (?, ?, ?, ?)'
);
for (const c of coupons) {
    insertCoupon.run(c.id, c.code, c.discount, c.appliesTo ? c.appliesTo.join(',') : null);
}

// Kamu rendelések
const orders: Order[] = [
    {
        id: 1,
        createdAt: new Date(),
        coupon: coupons[0],
        items: [
            { id: 1, name: 'Laptop', price: 1000, quantity: 1, category: 'electronics' },
            { id: 2, name: 'T-shirt', price: 20, quantity: 3, category: 'clothing' },
        ],
    },
    {
        id: 2,
        createdAt: new Date(),
        items: [
            { id: 3, name: 'Toy Car', price: 15, quantity: 2, category: 'toys' },
        ],
    },
    {
        id: 3,
        createdAt: new Date(),
        coupon: coupons[1],
        items: [
            { id: 6, name: 'Toy Car', price: 15, quantity: 2, category: 'toys' },
            { id:7, name: 'Laptop', price: 1000, quantity: 1, category: 'electronics' },
            { id: 8, name: 'T-shirt', price: 20, quantity: 3, category: 'clothing' },
        ],
    },
    {
        id: 4,
        createdAt: new Date(),
        coupon: coupons[1],
        items: [
        ],
    },
];

// Insert orders
const insertOrder = db.prepare(
    'INSERT INTO orders (id, createdAt, couponId) VALUES (?, ?, ?)'
);
const insertItem = db.prepare(
    'INSERT OR IGNORE INTO items (id, orderId, name, price, quantity, category) VALUES (?, ?, ?, ?, ?, ?)'
);

for (const o of orders) {
    insertOrder.run(o.id, o.createdAt.toISOString(), o.coupon?.id ?? null);
    for (const i of o.items) {
        insertItem.run(i.id, o.id, i.name, i.price, i.quantity, i.category);
    }
}

console.log('SEEDING DB COMPLETED!!!!');


// Export DB ha kell közvetlen query-hez
export { db };
