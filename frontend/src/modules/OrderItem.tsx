import axios from "axios";
import { useEffect, useReducer } from "react";

type State = {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    orderDetail: any | null;
};

type Action =
    | { type: "TOGGLE_OPEN" }
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: any }
    | { type: "FETCH_ERROR"; payload: string };

function reducer(state: State, action: Action) {
    switch (action.type) {
        case  "TOGGLE_OPEN":
            return {...state,  isOpen: !state.isOpen};
        case  "FETCH_START":
            return {...state,  isLoading: true, error: null };
        case  "FETCH_SUCCESS":
            return {...state,  isLoading: false, orderDetail: action.payload };
        case  "FETCH_ERROR":
            return {...state,  isLoading: false, error: action.payload };
        default:
            return state;
    }
}

export default function OrderItem(props: { id: number; createdAt: Date }) {
    const [state, dispatch] = useReducer(reducer, {
        isOpen: false,
        isLoading: false,
        error: null,
        orderDetail: null,
    });

    async function fetchOrderSummary() {
        try {
            dispatch({ type: "FETCH_START" });
            const res = await axios.get<any>(
                `http://localhost:3001/orders/${props.id}/summary`
            );
            dispatch({ type: "FETCH_SUCCESS", payload: res.data });
        } catch (e: any) {
            dispatch({ type: "FETCH_ERROR", payload: e.message || "Failed to fetch order details" });
        }
    }

    // Trigger API call when the component is opened
    useEffect(() => {
        if (state.isOpen && !state.orderDetail) {
            fetchOrderSummary();
        }
    }, [state.isOpen]);

    return (
        <div
            style={{
                width: "100%",
                padding: "12px",
                marginBottom: "8px",
                cursor: "pointer",
                textAlign: "left",
            }}
            onClick={() => dispatch({ type: "TOGGLE_OPEN" })}
        >
            <h3>Order #{props.id}</h3>
            <p>Created at: {props.createdAt.toLocaleString()}</p>

            {state.isOpen && (
                <div style={{ marginTop: "12px" }}>
                    {state.isLoading && <p>Loading details...</p>}
                    {state.error && <p style={{ color: "red" }}>{state.error}</p>}
                    {state.orderDetail && (
                        <>
                            <p>
                                Total Price: <strong>{state.orderDetail.totalPrice}</strong>
                            </p>
                            {state.orderDetail.coupon && (
                                <p>
                                    Coupon: {state.orderDetail.coupon.code} (
                                    {state.orderDetail.coupon.discount}
                                    %)
                                </p>
                            )}
                            <ul style={{ paddingLeft: "16px" }}>
                                {state.orderDetail.items.map((item:any) => (
                                    <li key={item.id}>
                                        {item.name} — {item.quantity} x ${item.price}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}