export type Order = {
    id: number;
    items: Item[];
    createdAt: Date;
    coupon?: Coupon;
}

export type Item = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    category: string;
}

export type Coupon = {
    id: number;
    code: string;
    discount: number;
    appliesTo?: string[];
};

export type OrderSummary = Order & { totalPrice: number };

export const CATEGORIES = ['electronics', 'clothing', 'toys', 'clothing', 'food'];

