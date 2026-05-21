import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

const app = express();
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
}));
app.use(express.json());

app.use("/api", routes);

app.use(errorHandler);

export default app;
