import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/auth";
import { authRouter } from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

// Auth middleware for protected routes
app.use("/protected", authMiddleware);

// Auth routes
app.use("/auth", authRouter);

export default app;
