import type{ Request } from "express";
import type { Response } from "express";
import { Router } from "express";
import { prismaclient } from "db/client"
export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
    const Response = prismaclient;
});

authRouter.get("/calender" , (req : Request , res : Response) =>{

})