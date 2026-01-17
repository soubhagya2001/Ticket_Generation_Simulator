import express from "express";
import { config } from "dotenv";
import cors from "cors";
import home from "./routes/home.js";
import gettrain from "./routes/getTrains.js";
import ticketRoutes from "./routes/ticketRoutes.js";

config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({
  origin: process.env.ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/", home);
app.use("/trains", gettrain);
app.use("/tickets", ticketRoutes);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
