import express, {RequestHandler} from "express";
import cors, {type CorsOptions} from 'cors';
import {OrderRepository} from "./repostiroies/OrderRepository";
import {OrderNotFoundError, OrderService} from "./services/OrderService";
const PORT = 3001;

const app = express();

const corsOptions: CorsOptions = {
    origin: 'http://localhost:5173',
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/orders/:id/summary', async (req: express.Request, res: express.Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        res.status(404).send("Wrong id format");
    }
    try {
        const result = await OrderService.create().getOrderSummary(id);
        res.status(200).send(result);
    } catch (e) {
        if (e instanceof OrderNotFoundError) {
            res.status(404).send({error: e.message});
        }
    }
});

app.get('/orders', async (req: express.Request, res: express.Response) => {
    const orders = await OrderRepository.create().getOrders();
    res.json(orders);
});

OrderRepository.create();




app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

