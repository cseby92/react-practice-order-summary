import { db } from '../db/database';
import {Item, Order} from '../types';
import {Database} from "better-sqlite3";

type OrderCouponItemAggregate = {
    orderId: number;
    createdAt: string;
    couponId?: number | null;
    itemId?: number | null;
    name?: string | null;
    price?: number | null;
    quantity?: number | null;
    category?: string | null;
    couponCode?: string | null;
    couponDiscount?: number | null;
    couponAppliesTo?: string[] | null;
};

export class OrderRepository {
    private db: Database;

    public static create() {
        return new OrderRepository(db);
    }

    constructor(private database: Database) {
        this.db = database;
    }

    public async getOrder(id: number): Promise<Order | null> {
        const stmt = this.db.prepare(`
            SELECT orders.id AS orderId, orders.createdAt, orders.couponId,
                   items.id AS itemId, items.name, items.price, items.quantity, items.category,
                   coupons.code AS couponCode, coupons.discount AS couponDiscount, coupons.appliesTo AS couponAppliesTo
            FROM orders
                     LEFT JOIN items ON items.orderId = orders.id
                     LEFT JOIN coupons ON coupons.id = orders.couponId
            WHERE orders.id = ?
        `);

        const rows : OrderCouponItemAggregate[] = stmt.all(id) as OrderCouponItemAggregate[];
        if (rows.length === 0) return Promise.resolve(null);

        const firstRow = rows[0] as OrderCouponItemAggregate;

        const items: Item[] = rows
            .filter((r: OrderCouponItemAggregate) => r.itemId !== null)
            .map((r: OrderCouponItemAggregate) => ({
                id: r.itemId!,
                name: r.name!,
                price: r.price!,
                quantity: r.quantity!,
                category: r.category!
            }));


        const order: Order = {
            id: firstRow.orderId,
            createdAt: new Date(firstRow.createdAt),
            items: [],
        };

        if (firstRow.couponId) {
            order.coupon = {
                id: firstRow.couponId,
                code: firstRow.couponCode!,
                discount: firstRow.couponDiscount!,
            }
            if (firstRow.couponAppliesTo) {
                order.coupon.appliesTo = firstRow.couponAppliesTo;
            }
        }
        order.items = items;
        return Promise.resolve(order);
    }

    public async getOrders(): Promise<Pick<Order, 'id' | 'createdAt'>[]> {
        return Promise.resolve(this.db.prepare(`SELECT id, createdAt FROM orders`).all() as Pick<Order, 'id' | 'createdAt'>[]);
    }
}