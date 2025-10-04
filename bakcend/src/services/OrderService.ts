import {cachedDataVersionTag} from "node:v8";
import {db} from "../db/database";
import {OrderRepository} from "../repostiroies/OrderRepository";
import {Item, Order, OrderSummary} from "../types";

export class OrderNotFoundError extends Error {}

export class OrderService {
    private orderRepository: OrderRepository;

    public static create() {
        const orderRepository = OrderRepository.create();
        return new OrderService(orderRepository);
    }

    constructor(orderRepository: OrderRepository) {
        this.orderRepository = orderRepository;
    }

    async getOrderSummary(id: number): Promise<OrderSummary> {
        const order : Order | null = await this.orderRepository.getOrder(id);
        if (!order) {
            throw new OrderNotFoundError('Non existent order');
        }
        const totalPrice = this.calculateTotalPrice(order);

        return {
            totalPrice,
            ...order
        }
    }

    private calculateTotalPrice(order: Order): number {
        return order.items.reduce((total, item) => {
            let itemPrice = item.price * item.quantity;
            const coupon = order.coupon;
            const isCouponApplicableToItem =
                coupon &&
                (!coupon.appliesTo || coupon.appliesTo.includes(item.category));
            if (isCouponApplicableToItem) {
                itemPrice -= itemPrice * (coupon.discount / 100);
            }

            return total + itemPrice;
        }, 0);
    }
}