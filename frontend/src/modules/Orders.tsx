import {useEffect, useReducer, useState} from "react";
import axios from 'axios';
import {Loading} from "./Loading.tsx";
import OrderItem from "./OrderItem.tsx";

type State = {
    orders: { id: number, createdAt: string}[],
    loading: boolean,
    error: string|null
}

type Action =
    { type: "FETCH_START" } |
    { type: "FETCH_ERROR", payload: string } |
    { type: "FETCH_SUCCESS", payload: any};

function reducer(state: State, action: Action) {
    switch (action.type) {
        case "FETCH_START":
            return {...state, isLoading: true};
        case "FETCH_SUCCESS":
            return {...state, isLoading: false, orders: action.payload};
        case "FETCH_ERROR":
            return {...state, isLoading: false, error: action.payload};
        default:
            return state;
    }
}

export default function Orders() {
    const [state, dispatch] = useReducer(reducer, {
        orders: [],
        loading: false,
        error: null,
    });
    async function fetchOrders() {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.get('http://localhost:3001/orders');
            dispatch({ type: "FETCH_SUCCESS", payload: response.data });
        } catch (error) {
            console.log(error)
            if(error instanceof Error) {
                dispatch({ type: "FETCH_ERROR", payload: error.message });
            }
        }
    }
    useEffect(() => {
        fetchOrders();
    }, [])

    return (<>
        { state.loading ? <Loading/> :
            (
                state.error ? <div> Error loading orders... </div> :
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',   // ez középre rendezi a li-kat
                    gap: '12px',
                }}>
                    {
                        state.orders.map((order) => (
                            <li key={order.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '800px',       // fix vagy maxWidth
                                padding: '12px',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>
                                <OrderItem id={order.id} createdAt={new Date(order.createdAt)}></OrderItem>
                            </li>
                        ))
                    }
                </ul>
            )
        }

        <ul style={{ listStyle: 'none', padding: 0, maxWidth: '800px', margin: 'auto' }}>

        </ul>
    </>)
}