import express from "express";
import cors from "cors";
import { adminauthMiddleware, userauthMiddleware } from "./middleware/auth";
import { userRouter } from "./routes/userauth";
import { adminrouter } from "./routes/adminauth";

const app = express();

app.use(cors());
app.use(express.json());



// Auth routes
app.use("/user", userauthMiddleware, userRouter);

app.use("/admin" , adminauthMiddleware, adminrouter )

export default app;
